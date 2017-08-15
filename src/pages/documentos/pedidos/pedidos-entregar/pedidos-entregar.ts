import {Dolar} from './../../../../models/fondos.clases';
import {
  PrintPedidoEntregaPage
} from './../../print/print-pedido-entrega/print-pedido-entrega';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';
import {DolarProvider} from './../../../../providers/dolar/dolar';
import {UsuarioProvider, CV} from './../../../../providers/usuario/usuario';
import {Usuario} from './../../../../models/user.class';
import {Cliente} from './../../../../models/clientes.clases';
import {
  Pedido,
  calcularTotalFinal,
  calSubTotalCDs
} from './../../../../models/pedidos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  ToastController,
  LoadingController
} from 'ionic-angular';
import {FECHA} from '../../../../models/comunes.clases';
import * as moment from 'moment';

@Component({
  selector: 'page-pedidos-entregar',
  templateUrl: 'pedidos-entregar.html',
})
export class PedidosEntregarPage {
  pedido: Pedido;
  cliente: Cliente;
  usuario: Usuario;
  CVs: CV[];
  dolar: Dolar;
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
      this.pedido.fechaEntrega = moment().format(FECHA);
      this.usuarioP.getCurrentUser().subscribe(
          (user) => { this.usuario = user; });
      this.usuarioP.getCV().subscribe((cvs) => { this.CVs = cvs; });
      this.dolarP.getDolar().subscribe(
          (dolar) => { this.pedido.Dolar = dolar; });
    }
  }

  guardar() {
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast =
        this.toastCtrl.create({position: 'middle', closeButtonText: 'OK'});
    load.present().then(() => {
      this.pedidosP.setEntregado(this.pedido)
          .subscribe(
              (ok) => {
                load.dismiss();
                this.print();
                this.navCtrl.pop();
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

  borrar() {
    let alert = this.alertCtrl.create({
      title: 'Eliminar...',
      subTitle: 'Esta seguro que desea Eliminar el pedido?',
      message:
          'Se eliminara definitivamente el pedido, se actualizara el stock y la Cta.Cte.',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: () => { this.borrarProcess(); }
        }
      ]
    });
    alert.present();
  }

  private borrarProcess() {
    let load = this.loadCtrl.create({content: 'Eliminando Pedido...'});
    load.present().then(() => {
      let toast = this.toastCtrl.create({position: 'middle'});
      this.pedidosP.removeEmbalado(this.pedido)
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
      subTitle: `maximo autorizado ${this.usuario.maxDescuentoGeneral}%`,
      inputs: [
        {
          type: 'number',
          name: 'descuento',
          placeholder: 'Ingrese el descuento...',
          min: 0,
          max: this.usuario.maxDescuentoGeneral,
          value: `${this.pedido.descuentoGeneral}`
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
              if (d <= this.usuario.maxDescuentoGeneral) {
                this.pedido.descuentoGeneral = d;
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
        label: cv.tipo,
        checked: cv == this.pedido.CV
      });
    });
    alert.present();
  }
  calTotalNeto(): number { return calSubTotalCDs(this.pedido); }
  calTotalFinal(): number { return calcularTotalFinal(this.pedido); }

  ionViewDidLoad() {}

  print() {
    this.navCtrl.push(PrintPedidoEntregaPage,
                      {Pedido: this.pedido, Cliente: this.cliente});
  }
}
