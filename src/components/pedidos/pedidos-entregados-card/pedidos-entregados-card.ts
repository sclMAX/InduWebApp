import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {
  calcularTotalFinal,
  Pedido,
  ENTREGADO
} from './../../../models/pedidos.clases';
import {
  PrintPedidoEntregaPage
} from './../../../pages/documentos/print/print-pedido-entrega/print-pedido-entrega';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../providers/pedidos/pedidos';

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
              private clientesP: ClientesProvider,
              public navCtrl: NavController) {}

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  getCliente(id): Cliente {
    if (this.cliente) {
      return this.cliente;
    } else {
      return this.clientes.find((cliente) => { return (cliente.id == id); });
    }
  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PrintPedidoEntregaPage, {Pedido: pedido});
  }

  calTotalPedidoUs(pedido): number { return calcularTotalFinal(pedido); }

  calTotalUs():number{
    let t:number = 0;
    if(this.pedidos){
    this.pedidos.forEach((p)=>{
      t += Number(p.totalFinalUs || 0);
    });
    }
    return t;
  }


  calTotalKilos():number{
    let t:number = 0.00;
    if(this.pedidos){
      this.pedidos.forEach((p)=>{
        t += Number(p.totalUnidades || 0);
      });
    }
    return t;
  }

  private async getData() {
    if (this.cliente) {
      this.pedidosP.getAllCliente(this.cliente.id, ENTREGADO)
          .subscribe((data) => {
            this.pedidos = data
          });
    } else {
      this.pedidosP.getAll(ENTREGADO)
          .subscribe((data) => {this.pedidos = data});

      this.clientesP.getAll().subscribe(
          (clientes) => { this.clientes = clientes; });
    }
  }
}
