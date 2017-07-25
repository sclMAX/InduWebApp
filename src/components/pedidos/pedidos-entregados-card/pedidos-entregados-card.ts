import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {Cliente} from './../../../models/clientes.clases';
import {Pedido} from './../../../models/pedidos.clases';
import {Component, Input} from '@angular/core';
@Component({
  selector: 'pedidos-entregados-card',
  templateUrl: 'pedidos-entregados-card.html'
})
export class PedidosEntregadosCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;
  @Input() autoOcultar: boolean = false;

  pedidos: Pedido[];
  clientes: Cliente[];

  constructor(private pedidosP: PedidosProvider,
              private clientesP: ClientesProvider) {}

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      return this.clientes.find((cliente) => { return (cliente.id == id); });
    }
  }

  goPedido(pedido) {}

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id)
          .subscribe((data) => {
            this.pedidos = data.filter((pedido) => {
              return (pedido.isPreparado === true) &&
                     (pedido.isEntregado === true);
            });
          });
    } else {
      this.pedidosP.getPendientesEntregar().subscribe(
          (pedidos) => { this.pedidos = pedidos; });

      this.clientesP.getAll().subscribe(
          (clientes) => { this.clientes = clientes; });
    }
  }
}
