import {Pedido} from './../../../models/pedidos.clases';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Cliente} from './../../../models/clientes.clases';
import {Reparto, RepartoPedido} from './../../../models/repartos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-reparto-en-proceso',
  templateUrl: 'reparto-en-proceso.html',
})
export class RepartoEnProcesoPage {
  reparto: Reparto;
  private oldReparto: Reparto;
  clientes: Cliente[] = [];
  saldos: ({idCliente: number, saldo: number})[] = [];

  showDatos: boolean = true;
  showPedidosI: boolean = true;
  showPedidosSI: boolean = true;
  showTotales: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private ctacteP: CtasCtesProvider) {
    this.reparto = this.navParams.get('Reparto');
    if (this.reparto) {
      this.oldReparto = JSON.parse(JSON.stringify(this.reparto));
      this.getData();
    } else {
      this.navCtrl.pop();
    }
  }

  getPedidosImpresos(item: RepartoPedido): Pedido[] {
    return item.Pedidos.filter((p) => { return p.isImpreso; });
  }
  getPedidosNoImpresos(item: RepartoPedido): Pedido[] {
    return item.Pedidos.filter((p) => { return !p.isImpreso; });
  }

  getCliente(idCliente: number): Cliente {
    return this.clientes.find((c) => { return c.id == idCliente; });
  }

  getSaldo(idCliente: number): number {
    let i = this.saldos.find((s) => { return s.idCliente == idCliente; });
    if (i) {
      return i.saldo;
    }
    return 0.00;
  }

  private async getData() {
    this.clientes = [];
    this.saldos = [];
    this.reparto.Items.forEach((i) => {
      let idx = this.clientes.findIndex((c) => { return c.id == i.idCliente; });
      if (idx == -1) {
        this.clientesP.getOne(i.idCliente)
            .subscribe((cliente) => {
              this.ctacteP.getSaldoCliente(cliente.id)
                  .subscribe((saldo) => {
                    this.clientes.push(cliente);
                    this.saldos.push({idCliente: cliente.id, saldo: saldo});
                  });
            });
      }
    });
  }
}
