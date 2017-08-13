import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {calcularTotalFinal, Pedido} from './../../../models/pedidos.clases';
import {PrintPedidoEntregaPage} from './../../../pages/documentos/print/print-pedido-entrega/print-pedido-entrega';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {ENTREGADOS, PedidosProvider} from './../../../providers/pedidos/pedidos';

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

  constructor(
      private pedidosP: PedidosProvider, private clientesP: ClientesProvider,
      public navCtrl: NavController) {}

  ngOnInit() {
    this.getData();
  }
  ionViewWillEnter() {
    this.getData();
  }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      return this.clientes.find((cliente) => {
        return (cliente.id == id);
      });
    }
  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PrintPedidoEntregaPage, {Pedido: pedido});
  }

  calTotalUs(pedido): number {
    return calcularTotalFinal(pedido);
  }
  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id, ENTREGADOS)
          .subscribe((data) => {this.pedidos = data});
    } else {
      this.pedidosP.getPendientesEntregar().subscribe((pedidos) => {
        this.pedidos = pedidos;
      });

      this.clientesP.getAll().subscribe((clientes) => {
        this.clientes = clientes;
      });
    }
  }
}
