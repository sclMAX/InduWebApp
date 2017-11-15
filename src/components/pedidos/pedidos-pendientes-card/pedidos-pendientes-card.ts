import {Observable} from 'rxjs/Observable';
import {
  PedidosEmbalarPage
} from './../../../pages/documentos/pedidos/pedidos-embalar/pedidos-embalar';
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {Pedido, PEDIDO} from './../../../models/pedidos.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'pedidos-pendientes-card',
  templateUrl: 'pedidos-pendientes-card.html'
})
export class PedidosPendientesCardComponent {
  @Input() cliente: Cliente;
  @Input() showList: boolean = false;

  pedidos: Observable<Pedido[]>;
  clientes: Cliente[] = [];

  constructor(public navCtrl: NavController, private pedidosP: PedidosProvider,
              private clientesP: ClientesProvider) {}

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      let cliente = this.clientes.find(c => c.id == id);
      if (cliente) {
        return cliente;
      }
      let fc = this.clientesP.getOne(id).subscribe(c => {
        if (c) {
          this.clientes.push(c);
          if (fc) fc.unsubscribe();
        }
      })
    }
  }

  getTotalKilos(pedidos): number {
    let total: number = 0.00;
    if (pedidos) {
      total = pedidos.reduce((a, b) => a + b.totalUnidades, 0);
    }
    return total;
  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PedidosEmbalarPage, {idPedido: pedido.id});
  }

  private async getData() {
    if (this.cliente) {
      this.pedidos = this.pedidosP.getAllCliente(this.cliente.id, PEDIDO);
    } else {
      this.pedidos = this.pedidosP.getAll(PEDIDO);
    }
  }
}
