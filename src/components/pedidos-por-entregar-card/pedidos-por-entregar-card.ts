import {Pedido} from './../../models/pedidos.clases';
import {PedidosProvider} from './../../providers/pedidos/pedidos';
import {NavController} from 'ionic-angular';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {Cliente} from './../../models/clientes.clases';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'pedidos-por-entregar-card',
  templateUrl: 'pedidos-por-entregar-card.html'
})
export class PedidosPorEntregarCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;
  @Input() autoOcultar: boolean = true;

  pedidos: Pedido[];
  clientes: Cliente[];

  constructor(public navCtrl: NavController, private pedidosP: PedidosProvider,
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

  goPedido(pedido, cliente) {}

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id)
          .subscribe((data) => {
            this.pedidos = data.filter((pedido) => {
              return (pedido.isPreparado === true) &&
                     (pedido.isEntregado === false);
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
