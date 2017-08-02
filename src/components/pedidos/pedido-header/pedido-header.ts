import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Pedido} from './../../../models/pedidos.clases';
import {Component, Input} from '@angular/core';
import {Cliente} from "../../../models/clientes.clases";

@Component({selector: 'pedido-header', templateUrl: 'pedido-header.html'})

export class PedidoHeaderComponent {
  @Input() pedido: Pedido;
  @Input() cliente: Cliente;
  @Input() showClienteDetalle: boolean = false;
  constructor(private clientesP: ClientesProvider) {}

  ngOnInit() {
    if (this.pedido && !this.cliente) {
      this.clientesP.getOne(this.pedido.idCliente)
          .subscribe((cliente) => { this.cliente = cliente; });
    }
  }
}
