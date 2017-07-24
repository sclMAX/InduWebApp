import {PedidosProvider} from './../../providers/pedidos/pedidos';
import {Component, Input} from '@angular/core';
import {PedidoItem} from './../../models/pedidos.clases';

@Component(
    {selector: 'pedido-items-item', templateUrl: 'pedido-items-item.html'})
export class PedidoItemsItemComponent {
  @Input() items: PedidoItem[];
  constructor(private pedidosP: PedidosProvider) {}

  calUnidades(item): number { return this.pedidosP.calUnidades(item); }

  calPrecioU$(item) { return this.pedidosP.calPrecioU$(item); }

  calSubTotalU$(item) { return this.pedidosP.calSubTotalU$(item); }

  removeItem(idx) { this.items.splice(idx, 1); }
}
