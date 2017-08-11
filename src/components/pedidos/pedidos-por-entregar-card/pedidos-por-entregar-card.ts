import {
  PedidosEntregarPage
} from './../../../pages/documentos/pedidos/pedidos-entregar/pedidos-entregar';
import {Pedido} from './../../../models/pedidos.clases';
import { PedidosProvider, EMBALADOS } from './../../../providers/pedidos/pedidos';
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

  getTotalUnidades(): number {
    let t: number = 0.00;
    if (this.pedidos) {
      this.pedidos.forEach((pedido) => { t += pedido.TotalUnidades * 1; });
    }
    return t;
  }

  getSubTotalUs(pedido: Pedido): number {
    if (pedido) {
      return pedido.TotalUs / ((pedido.DescuentoKilos > 0) ?
                                   (1 + (pedido.DescuentoKilos / 100)) :
                                   1);
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

  goPedido(pedido: Pedido) {
    this.navCtrl.push(
        PedidosEntregarPage,
        {Pedido: pedido, Cliente: this.getCliente(pedido.idCliente)});
  }

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id, EMBALADOS)
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
