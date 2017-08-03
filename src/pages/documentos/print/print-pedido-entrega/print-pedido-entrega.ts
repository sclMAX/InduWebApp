import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {CtasCtesProvider} from './../../../../providers/ctas-ctes/ctas-ctes';
import {Cliente} from './../../../../models/clientes.clases';
import {
  Pedido,
  calSubTotalCDs,
  calcularTotalFinal
} from './../../../../models/pedidos.clases';
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
              private ctacteP: CtasCtesProvider,
              private clientesP: ClientesProvider) {
    this.pedido = this.navParams.get('Pedido');
    this.cliente = this.navParams.get('Cliente');
    if (!this.pedido) {
      this.navCtrl.pop();
    } else {
      if (!this.cliente) {
        this.clientesP.getOne(this.pedido.idCliente)
            .subscribe(
                (c) => {
                  if (c) {
                    this.cliente = c;
                  } else {
                    this.navCtrl.pop();
                  }
                },
                (error) => {
                  console.error(error);
                  this.navCtrl.pop();
                });
      }
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

  getTotalConDescuentos(): number { return calSubTotalCDs(this.pedido); }

  calTotalFinal(): number { return calcularTotalFinal(this.pedido); }
  ionViewDidLoad() {}
}
