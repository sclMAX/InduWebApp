import {Component} from '@angular/core';
import {LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';

import {Cliente} from './../../../../models/clientes.clases';
import {Pedido, PedidoItem} from './../../../../models/pedidos.clases';
import {SucursalPedidosProvider} from './../../../../providers/sucursal-pedidos/sucursal-pedidos';

@Component({
  selector: 'page-pedidos-new',
  templateUrl: 'pedidos-new.html',
})
export class PedidosNewPage {
  cliente: Cliente;
  pedido: Pedido;
  isEdit: boolean = false;
  totalUnidades: number = 0.00;

  constructor(
      public navCtrl: NavController, public navParams: NavParams,
      private sucPedP: SucursalPedidosProvider,
      private loadCtrl: LoadingController, private toastCtrl: ToastController) {
    this.cliente = this.navParams.get('Cliente');
    this.pedido = this.navParams.get('Pedido');
    if (this.cliente) {
      if (this.pedido) {
        this.isEdit = true;
      } else {
        this.pedido = new Pedido();
        this.pedido.idCliente = this.cliente.id;
        this.pedido.DireccionEntrega = this.cliente.Direccion;
        this.isEdit = false;
        this.sucPedP.getCurrentNro().subscribe((data: number) => {
          this.pedido.Numero = data;
        });
      }
    } else {
      this.navCtrl.pop();
    }
  }

  ionViewDidLoad() {}

  onGuardar() {
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast =
        this.toastCtrl.create({position: 'middle', showCloseButton: true});
    load.present().then(() => {
      this.sucPedP.add(this.pedido)
          .subscribe(
              (ok) => {
                console.log('OK');
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
    });
  }

  goBack() {
    this.navCtrl.pop();
  }

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
  calUnidades(i: PedidoItem): number {
    let u: number = 0.00;
    let pxm: number =
        (i.Color.isPintura) ? i.Perfil.PesoPintado : i.Perfil.PesoNatural;
    u = i.Cantidad * (pxm * (i.Perfil.Largo / 1000));
    return u;
  }
  calPrecioU$(i: PedidoItem): number {
    let p: number = 0.00;
    p = i.Color.PrecioUs;
    return p;
  }
  calSubTotalU$(i: PedidoItem): number {
    let s: number = 0.00;
    s = this.calUnidades(i) * this.calPrecioU$(i);
    return s;
  }
  calTotalU$(): number {
    let tU$: number = 0.00;
    this.totalUnidades = 0.00;
    if (this.pedido && this.pedido.Items) {
      this.pedido.Items.forEach((i) => {
        tU$ += this.calSubTotalU$(i);
        this.totalUnidades += this.calUnidades(i);
      });
      }
    return tU$;
  }
}
