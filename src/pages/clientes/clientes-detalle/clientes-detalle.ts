import {
  PedidosNewPage
} from './../../documentos/pedidos/pedidos-new/pedidos-new';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Cliente} from './../../../models/clientes.clases';
import {Pedido, PRESUPUESTO} from './../../../models/pedidos.clases';
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

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private pedidosP: PedidosProvider) {
    this.cliente = this.navParams.get('Cliente');
    if (this.cliente) {
      this.title = this.cliente.nombre;
      this.getPedidos();
    } else {
      this.navCtrl.pop();
    }
  }

  onClickPresupuestosItem(item) {
    this.navCtrl.push(PedidosNewPage,
                      {Cliente: this.cliente, Pedido: item, tipo: PRESUPUESTO});
  }

  private async getPedidos() {
    this.pedidosP.getAllCliente(this.cliente.id, PRESUPUESTO)
        .subscribe((pedidos) => { this.pedidos = pedidos; });
  }
}
