import {
  SucursalPedidosProvider
} from './../../providers/sucursal-pedidos/sucursal-pedidos';
import {Component, Input} from '@angular/core';
import {PedidoItem} from './../../models/pedidos.clases';

@Component(
    {selector: 'pedido-items-item', templateUrl: 'pedido-items-item.html'})
export class PedidoItemsItemComponent {
  @Input() items: PedidoItem[];
  constructor(private sucPedidosP: SucursalPedidosProvider) {}

  calUnidades(item): number { return this.sucPedidosP.calUnidades(item); }

  calPrecioU$(item): number { return this.sucPedidosP.calPrecioU$(item); }

  calSubTotalU$(item): number { return this.sucPedidosP.calSubTotalU$(item); }

  removeItem(idx) { this.items.splice(idx, 1); }
}
