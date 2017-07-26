import {
  PedidosEmbalarPage
} from './../../../pages/documentos/pedidos/pedidos-embalar/pedidos-embalar';
import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {Pedido} from './../../../models/pedidos.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

@Component({
  selector: 'pedidos-pendientes-card',
  templateUrl: 'pedidos-pendientes-card.html'
})
export class PedidosPendientesCardComponent {
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
      if(this.clientes){
      return this.clientes.find((cliente) => { return (cliente.id == id); });
      }else{
        return null;
      }
    }
  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PedidosEmbalarPage, {idPedido: pedido.Numero});
  }

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id)
          .subscribe((data) => {
            this.pedidos = data.filter(
                (pedido) => { return (pedido.isPreparado === false); });
          });
    } else {
      this.pedidosP.getPendientesEmbalar(false)
          .subscribe((pedidos) => { this.pedidos = pedidos; });

      this.clientesP.getAll().subscribe(
          (clientes) => { this.clientes = clientes; });
    }
  }
}
