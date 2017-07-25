import {Cliente} from './../../../models/clientes.clases';
import {Pedido, PedidoItem} from './../../../models/pedidos.clases';
import {Component, Input} from '@angular/core';
@Component(
    {selector: 'pedido-header-edit', templateUrl: 'pedido-header-edit.html'})
export class PedidoHeaderEditComponent {
  @Input() pedido: Pedido;
  @Input() cliente: Cliente;
  @Input() validDireccion: boolean = false;
  isShowEntrega: boolean = false;
  isShowAddItem: boolean = true;
  newItem: PedidoItem = new PedidoItem();
  constructor() {}

  
}
