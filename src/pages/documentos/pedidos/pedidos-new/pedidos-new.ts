import {
  ContadoresProvider
} from './../../../../providers/contadores/contadores';
import {Component} from '@angular/core';
import {
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import {Cliente} from './../../../../models/clientes.clases';
import {Pedido} from './../../../../models/pedidos.clases';
import {DolarProvider} from './../../../../providers/dolar/dolar';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';

@Component({
  selector: 'page-pedidos-new',
  templateUrl: 'pedidos-new.html',
})
export class PedidosNewPage {
  cliente: Cliente;
  pedido: Pedido;
  oldPedido: Pedido;
  isEdit: boolean = false;
  dolarValor: number = 0.00;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private pedidosP: PedidosProvider, private dolarP: DolarProvider,
              private loadCtrl: LoadingController,
              private contadoresP: ContadoresProvider,
              private toastCtrl: ToastController) {
    this.cliente = this.navParams.get('Cliente');
    this.oldPedido = this.navParams.get('Pedido');
    if (this.cliente) {
      if (this.oldPedido) {
        this.isEdit = true;
        this.pedido = JSON.parse(JSON.stringify(this.oldPedido));
      } else {
        this.pedido = new Pedido();
        this.pedido.idCliente = this.cliente.id;
        this.pedido.DireccionEntrega = this.cliente.Direccion;
        this.isEdit = false;
        this.getData();
      }
    } else {
      this.navCtrl.pop();
    }
    this.getDolarValor();
  }

  ionViewDidLoad() {}

  onGuardar() {
    this.oldPedido = this.pedido;
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      if (this.isEdit) {
        this.pedidosP.update(this.oldPedido)
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
      } else {
        this.pedidosP.add(this.oldPedido)
            .subscribe(
                (ok) => {
                  this.navCtrl.pop();
                  load.dismiss();
                  toast.setMessage(ok);
                  toast.setDuration(2000);
                  toast.present();
                },
                (error) => {
                  load.dismiss();
                  toast.setMessage(error);
                  toast.present();
                });
      }
    });
  }

  goBack() { this.navCtrl.pop(); }

  isDireccionValid(): boolean {
    let estado: boolean = false;
    estado = (this.pedido.DireccionEntrega.Calle) &&
             (this.pedido.DireccionEntrega.Calle.trim().length > 0);
    estado = estado && (this.pedido.DireccionEntrega.Localidad) &&
             (this.pedido.DireccionEntrega.Localidad.trim().length > 0);
    estado = estado && (this.pedido.FechaEntrega) &&
             (this.pedido.FechaEntrega.trim().length > 0);
    return estado;
  }

  isValid(): boolean {
    let estado: boolean = false;
    estado = (this.pedido && (this.pedido.Items.length > 0));
    estado = estado && this.isDireccionValid();
    estado = estado && this.pedido.idCliente > 0;
    return estado;
  }

  calTotalU$() { return this.pedidosP.calTotalU$(this.pedido, this.cliente); }

  calTotal$() { return this.pedidosP.calTotal$(this.pedido, this.cliente); }

  async getDolarValor() {
    this.dolarP.getDolarValor().subscribe(
        (val: number) => { this.dolarValor = val; })
  }

  calTotalUnidades(): number {
    this.pedido.TotalUnidades =
        this.pedidosP.calTotalUnidades(this.pedido.Items);
    return this.pedido.TotalUnidades;
  }

  calTotalBarras(): number {
    return this.pedidosP.calTotalBarras(this.pedido.Items);
  }

  calDescuentoKilos() {
    this.calTotalUnidades();
    this.pedido.DescuentoKilos = this.pedidosP.calDescuentoKilos(this.pedido);
    return this.pedido.DescuentoKilos;
  }

  calTotalU$ConDescuento(): number {
    let des: number = this.pedido.DescuentoKilos * 1;
    return this.calTotalU$() / ((des > 0) ? (1 + (des / 100)) : 1);
  }

  private async getData() {
    this.contadoresP.getPedidosCurrentNro().subscribe(
        (data: number) => { this.pedido.Numero = data; });
  }
}
