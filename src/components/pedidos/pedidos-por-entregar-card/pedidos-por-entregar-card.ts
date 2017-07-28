import {Pedido, PedidoItem} from './../../../models/pedidos.clases';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';
import {NavController} from 'ionic-angular';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Cliente} from './../../../models/clientes.clases';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'pedidos-por-entregar-card',
  templateUrl: 'pedidos-por-entregar-card.html'
})
export class PedidosPorEntregarCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;

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
      if (this.clientes) {
        return this.clientes.find((cliente) => { return (cliente.id == id); });
      } else {
        return null;
      }
    }
  }

  getSubTotalUnidades(items: PedidoItem[]): number {
    if (items) {
      return this.pedidosP.calTotalUnidades(items);
    } else {
      return 0.00;
    }
  }

  getTotalUnidades(): number {
    let t: number = 0.00;
    if (this.pedidos) {
      this.pedidos.forEach(
          (pedido) => { t += this.getSubTotalUnidades(pedido.Items) * 1; });
    }
    return t;
  }

  getSubTotalUs(pedido: Pedido): number {
    if (pedido) {
      return this.pedidosP.calTotalU$(pedido,
                                      this.getCliente(pedido.idCliente));
    } else {
      return 0.00;
    }
  }

  getTotalUs(): number {
    let t: number = 0.00;
    if (this.pedidos) {
      this.pedidos.forEach(
          (pedido) => { t += this.getSubTotalUs(pedido) * 1; });
    }
    return t;
  }

  goPedido(pedido) {}

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id)
          .subscribe((data) => {
            if (data) {
              this.pedidos = data.filter((pedido) => {
                return (pedido.isPreparado === true) &&
                       (pedido.isEntregado === false);
              });
            }
          });
    } else {
      this.pedidosP.getPendientesEntregar().subscribe(
          (pedidos) => { this.pedidos = pedidos; });
      this.clientesP.getAll().subscribe(
          (clientes) => { this.clientes = clientes; });
    }
  }
}
