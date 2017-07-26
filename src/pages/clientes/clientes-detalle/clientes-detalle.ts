import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Cliente} from './../../../models/clientes.clases';
import {Pedido} from './../../../models/pedidos.clases';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'page-clientes-detalle',
  templateUrl: 'clientes-detalle.html',
})
export class ClientesDetallePage {
  title: string;
  cliente: Cliente;
  pedidos: Pedido[];
  pedidosEntregados: Pedido[];

  constructor(
      public navCtrl: NavController, public navParams: NavParams,
      private pedidosP: PedidosProvider) {
    this.cliente = this.navParams.get('Cliente');
    if (this.cliente) {
      this.title = this.cliente.Nombre;
      this.getPedidos();
    } else {
      this.navCtrl.pop();
    }
  }

  private async getPedidos() {
    this.pedidosP.getAllCliente(this.cliente.id).subscribe((pedidos) => {
      this.pedidos = pedidos;
    });
  }
}
