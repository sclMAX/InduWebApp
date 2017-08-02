import {CtasCtesProvider} from './../../../../providers/ctas-ctes/ctas-ctes';
import {Dolar} from './../../../../models/fondos.clases';
import {
  PrintPedidoEntregaPage
} from './../../print/print-pedido-entrega/print-pedido-entrega';
import {
  PrintPedidoParaEmbalarPage
} from './../../print/print-pedido-para-embalar/print-pedido-para-embalar';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';
import {DolarProvider} from './../../../../providers/dolar/dolar';
import {UsuarioProvider, CV} from './../../../../providers/usuario/usuario';
import {Usuario} from './../../../../models/user.class';
import {Cliente} from './../../../../models/clientes.clases';
import {Pedido} from './../../../../models/pedidos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  ToastController,
  LoadingController
} from 'ionic-angular';

@Component({
  selector: 'page-pedidos-entregar',
  templateUrl: 'pedidos-entregar.html',
})
export class PedidosEntregarPage {
  pedido: Pedido;
  cliente: Cliente;
  usuario: Usuario;
  CVs: CV[];
  dolar: number = 0.00;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private loadCtrl: LoadingController,
              private pedidosP: PedidosProvider,
              private usuarioP: UsuarioProvider,
              private dolarP: DolarProvider) {
    this.pedido = this.navParams.get('Pedido');
    this.cliente = this.navParams.get('Cliente');
    if (!this.pedido || !this.cliente) {
      this.navCtrl.pop();
    } else {
      this.usuarioP.getCurrentUser().subscribe(
          (user) => { this.usuario = user; });
      this.usuarioP.getCV().subscribe((cvs) => { this.CVs = cvs; });
      this.dolarP.getDolarValor().subscribe((dolar) => { this.dolar = dolar; });
    }
  }

  guardar() {
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast =
        this.toastCtrl.create({position: 'middle', closeButtonText: 'OK'});
    load.present().then(() => {
      this.pedido.isEntregado = true;
      this.pedidosP.update(this.pedido)
          .subscribe(
              (ok) => {
                this.navCtrl.pop();
                load.dismiss();
                toast.setMessage(ok);
                toast.setDuration(1000);
                toast.present();
              },
              (error) => {
                load.dismiss();
                toast.setMessage(error);
                toast.setShowCloseButton(true);
                toast.present();
              });
    });
  }

  isValid(): boolean {
    let res: boolean = false;
    res = this.pedido.CV != null;
    return res;
  }

  goBack() { this.navCtrl.pop(); }

  setDescuentoGeneral() {
    let alert = this.alertCtrl.create({
      title: 'Descuento General (%)',
      subTitle: `maximo autorizado ${this.usuario.MaxDescuentoGeneral}%`,
      inputs: [
        {
          type: 'number',
          name: 'descuento',
          placeholder: 'Ingrese el descuento...',
          min: 0,
          max: this.usuario.MaxDescuentoGeneral,
          value: `${this.pedido.DescuentoGeneral}`
        }
      ],
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data) {
              let d: number = data.descuento * 1;
              if (d >= 0 && d <= this.usuario.MaxDescuentoGeneral) {
                this.pedido.DescuentoGeneral = d;
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  setCV() {
    let alert = this.alertCtrl.create({
      title: 'CV',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data) {
              this.pedido.CV = this.CVs[data];
            }
          }
        }
      ]
    });
    this.CVs.forEach((cv, idx) => {
      alert.addInput({
        id: `${idx}`,
        name: `${idx}`,
        type: 'radio',
        value: `${idx}`,
        label: cv.Tipo,
        checked: cv == this.pedido.CV
      });
    });
    alert.present();
  }

  calTotalCDK(): number {
    if (this.pedido) {
      return this.pedido.TotalUs /
             ((this.pedido.DescuentoKilos > 0) ?
                  (1 + (this.pedido.DescuentoKilos / 100)) :
                  1);
    }
    return 0.00;
  }

  calTotalNeto(): number {
    if (this.pedido) {
      return this.calTotalCDK() /
             ((this.pedido.DescuentoGeneral > 0) ?
                  (1 + (this.pedido.DescuentoGeneral / 100)) :
                  1);
    }
    return 0.00;
  }
  calTotalFinal(): number {
    if (this.pedido && this.pedido.CV) {
      return this.calTotalNeto() * ((this.pedido.CV.Monto > 0) ?
                                        (1 + (this.pedido.CV.Monto / 100)) :
                                        (1));
    }
    return 0.00;
  }

  ionViewDidLoad() {}

  print() {
    this.pedido.Dolar = new Dolar();
    this.pedido.Dolar.Fecha = new Date().toISOString();
    this.pedido.Dolar.Valor = this.dolar;
    this.navCtrl.push(PrintPedidoEntregaPage,
                      {Pedido: this.pedido, Cliente: this.cliente});
  }
}
