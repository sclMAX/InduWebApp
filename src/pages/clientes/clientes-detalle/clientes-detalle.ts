import {
  SucursalPedidosProvider
} from './../../../providers/sucursal-pedidos/sucursal-pedidos';
import {Pedido} from './../../../models/pedidos.clases';
import {Cliente} from './../../../models/clientes.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
@Component({
  selector: 'page-clientes-detalle',
  templateUrl: 'clientes-detalle.html',
})
export class ClientesDetallePage {
  title: string;
  cliente: Cliente;
  pedidos: Pedido[];
  pedidosEntregados: Pedido[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private pedidosP: SucursalPedidosProvider) {
    this.cliente = this.navParams.get('Cliente');
    if (this.cliente) {
      this.title = this.cliente.Nombre;
      this.getPedidos();
    } else {
      this.navCtrl.pop();
    }
  }

  private async getPedidos() {
    this.pedidosP.getAllCliente(this.cliente.id)
        .subscribe((pedidos) => {
          this.pedidos = pedidos;
        });
  }
}
