import {Component, Input} from '@angular/core';

import {PedidoItem} from './../../models/pedidos.clases';

@Component(
    {selector: 'pedido-items-item', templateUrl: 'pedido-items-item.html'})
export class PedidoItemsItemComponent {
  @Input() items: PedidoItem[];

  constructor() {}

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


  removeItem(idx) {
    this.items.splice(idx, 1);
  }
}
