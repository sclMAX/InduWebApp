import {Component, Input} from '@angular/core';
import {Cliente} from './../../../models/clientes.clases';
import {Pedido} from './../../../models/pedidos.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component(
    {selector: 'pedido-items-item', templateUrl: 'pedido-items-item.html'})
export class PedidoItemsItemComponent {
  @Input() pedido: Pedido;
  @Input() cliente: Cliente;
  constructor(
      private pedidosP: PedidosProvider, private clienteP: ClientesProvider) {}

  ngOnInit() {
    this.clienteP.getOne(this.pedido.idCliente).subscribe((cliente) => {
      this.cliente = cliente;
    });
  }

  calUnidades(item): number {
    return this.pedidosP.calUnidades(item);
  }

  calPrecioU$(item) {
    return this.pedidosP.calPrecioU$(item, this.cliente);
  }

  calSubTotalU$(item) {
    return this.pedidosP.calSubTotalU$(item, this.cliente);
  }

  removeItem(idx) {
    this.pedido.Items.splice(idx, 1);
  }
}
