import {CtasCtesProvider} from './../../../../providers/ctas-ctes/ctas-ctes';
import {Cliente} from './../../../../models/clientes.clases';
import {Pedido} from './../../../../models/pedidos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-print-pedido-entrega',
  templateUrl: 'print-pedido-entrega.html',
})
export class PrintPedidoEntregaPage {
  pedido: Pedido;
  cliente: Cliente;
  isPrint: boolean = false;
  saldo: number = 0.00;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private ctacteP: CtasCtesProvider) {
    this.pedido = this.navParams.get('Pedido');
    this.cliente = this.navParams.get('Cliente');
    if (!this.pedido) {
      this.navCtrl.pop();
    } else {
      this.ctacteP.getSaldoCliente(this.pedido.idCliente)
          .subscribe((saldo) => { this.saldo = saldo; })
    }
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }
  goBack() { this.navCtrl.pop(); }

  getTotalConDescuentoKilos(): number {
    if (this.pedido) {
      return (this.pedido.TotalUs /
              ((this.pedido.DescuentoKilos > 0) ?
                   1 + (this.pedido.DescuentoKilos / 100) :
                   1));
    }
    return 0.00;
  }

  getTotalConDescuentos(): number {
    if (this.pedido) {
      return this.getTotalConDescuentoKilos() /
             ((this.pedido.DescuentoGeneral > 0) ?
                  (1 + (this.pedido.DescuentoGeneral / 100)) :
                  1);
    }
    return 0.00;
  }

  calTotalFinal(): number {
    if (this.pedido && this.pedido.CV) {
      return this.getTotalConDescuentos() *
             ((this.pedido.CV.Monto > 0) ? (1 + (this.pedido.CV.Monto / 100)) :
                                           1);
    }
    return 0.00;
  }
  ionViewDidLoad() {}
}
