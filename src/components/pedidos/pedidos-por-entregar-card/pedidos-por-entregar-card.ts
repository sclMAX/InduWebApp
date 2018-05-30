import {DolarProvider} from './../../../providers/dolar/dolar';
import {Observable} from 'rxjs/Observable';
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Cliente} from './../../../models/clientes.clases';
import {Pedido, EMBALADO} from './../../../models/pedidos.clases';
import {
  PedidosEntregarPage
} from './../../../pages/documentos/pedidos/pedidos-entregar/pedidos-entregar';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'pedidos-por-entregar-card',
  templateUrl: 'pedidos-por-entregar-card.html'
})
export class PedidosPorEntregarCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;

  pedidos: Pedido[];
  dolar: Observable<number>;
  clientes: Cliente[];

  constructor(public navCtrl: NavController, private pedidosP: PedidosProvider,
              private clientesP: ClientesProvider,
              private dolarP: DolarProvider) {}

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
      this.pedidos.forEach((pedido) => { t += pedido.totalUnidades * 1; });
    }
    return t;
  }

  getSubTotalUs(pedido: Pedido): number {
    if (pedido) {
      return pedido.totalUs / ((pedido.descuentoKilos > 0) ?
                                   (1 + (pedido.descuentoKilos / 100)) :
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
    this.dolar = this.dolarP.getDolar().map(data => data.valor);
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id, EMBALADO)
          .subscribe((data) => {
            if (data) {
              this.pedidos = data;
            }
          });
    } else {
      this.pedidosP.getAll(EMBALADO)
          .subscribe((pedidos) => { this.pedidos = pedidos; });
      this.clientesP.getAll().subscribe(
          (clientes) => { this.clientes = clientes; });
    }
  }
}
