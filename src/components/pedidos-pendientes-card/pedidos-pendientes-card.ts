import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../models/clientes.clases';
import {Pedido} from './../../models/pedidos.clases';
import {PedidosNewPage} from './../../pages/documentos/pedidos/pedidos-new/pedidos-new';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {SucursalPedidosProvider} from './../../providers/sucursal-pedidos/sucursal-pedidos';

@Component({
  selector: 'pedidos-pendientes-card',
  templateUrl: 'pedidos-pendientes-card.html'
})
export class PedidosPendientesCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;

  pedidos: Pedido[];
  clientes: Cliente[];

  constructor(
      public navCtrl: NavController, private pedidosP: SucursalPedidosProvider,
      private clientesP: ClientesProvider) {}

  ngOnInit() {
    this.getData();
  }
  ionViewWillEnter() {
    this.getData();
  }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      return this.clientes.find((cliente) => {
        return (cliente.id == id);
      });
    }
  }

  goPedido(pedido, cliente) {
    this.navCtrl.push(PedidosNewPage, {Pedido: pedido, Cliente: cliente});
  }

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id).subscribe((data) => {
        this.pedidos = data.filter((pedido) => {
          return (pedido.isPreparado === false);
        });
      });
    } else {
      this.pedidosP.getPendientes().subscribe((pedidos) => {
        this.pedidos = pedidos;
      });

      this.clientesP.getAll().subscribe((clientes) => {
        this.clientes = clientes;
      });
    }
  }
}
