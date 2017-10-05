import {Component, Input} from '@angular/core';
import {Cliente} from './../../../models/clientes.clases';
import {Pedido, PedidoItem} from './../../../models/pedidos.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component(
    {selector: 'pedido-items-item', templateUrl: 'pedido-items-item.html'})
export class PedidoItemsItemComponent {
  @Input() pedido: Pedido;
  @Input() cliente: Cliente;
  @Input() showRemove: boolean = true;

  constructor(private pedidosP: PedidosProvider,
              private clienteP: ClientesProvider) {}

  ngOnInit() {
    this.clienteP.getOne(this.pedido.idCliente)
        .subscribe((cliente) => { this.cliente = cliente; });
  }

  calUnidades(item: PedidoItem): number {
    return this.pedidosP.calUnidades(item);
  }

  calPrecioU$(item: PedidoItem) {
    return this.pedidosP.calPrecioU$(item, this.cliente);
  }

  calSubTotalU$(item: PedidoItem) {
    return this.pedidosP.calSubTotalU$(item, this.cliente);
  }

  removeItem(idx: number) { this.pedido.Items.splice(idx, 1); }
}
