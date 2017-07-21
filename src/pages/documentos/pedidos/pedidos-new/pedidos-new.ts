import {DolarProvider} from './../../../../providers/dolar/dolar';
import {Observable} from 'rxjs/Observable';
import {Component} from '@angular/core';
import {
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';

import {Cliente} from './../../../../models/clientes.clases';
import {Pedido, PedidoItem} from './../../../../models/pedidos.clases';
import {
  SucursalPedidosProvider
} from './../../../../providers/sucursal-pedidos/sucursal-pedidos';

@Component({
  selector: 'page-pedidos-new',
  templateUrl: 'pedidos-new.html',
})
export class PedidosNewPage {
  cliente: Cliente;
  pedido: Pedido;
  isEdit: boolean = false;
  dolarValor: number = 0.00;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private sucPedP: SucursalPedidosProvider,
              private dolarP: DolarProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {
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
        this.sucPedP.getCurrentNro().subscribe(
            (data: number) => { this.pedido.Numero = data; });
      }
    } else {
      this.navCtrl.pop();
    }
    this.getDolarValor();
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

  calTotalU$(): number { return this.sucPedP.calTotalU$(this.pedido.Items); }

  async getDolarValor() {
    this.dolarP.getDolarValor()
        .subscribe((val: number) => { this.dolarValor = val; })
  }

  calTotalUnidades(): number {
    return this.sucPedP.calTotalUnidades(this.pedido.Items);
  }

  calTotalBarras(): number {
    return this.sucPedP.calTotalBarras(this.pedido.Items);
  }
}
