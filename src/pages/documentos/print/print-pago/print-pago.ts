import {Cliente, ClientePago} from './../../../../models/clientes.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-print-pago',
  templateUrl: 'print-pago.html',
})
export class PrintPagoPage {
  isPrint: boolean = false;
  cliente: Cliente;
  pago: ClientePago;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.cliente = this.navParams.get('Cliente');
    this.pago = this.navParams.get('Pago');
    if (!this.cliente || !this.pago) {
      this.navCtrl.pop();
    }
  }

  calTotalCheques$(): number {
    let res: number = 0.00;
    if (this.pago.Cheques) {
      this.pago.Cheques.forEach((c) => { res += c.Cheque.monto * 1; });
    }
    return res;
  }
  calTotalChequesU$(): number {
    let res: number = 0.00;
    if (this.pago.Cheques) {
      this.pago.Cheques.forEach(
          (c) => { res += c.Cheque.monto * 1 / c.Dolar.valor * 1; });
    }
    return res;
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }

  goBack() { this.navCtrl.pop(); }
}
