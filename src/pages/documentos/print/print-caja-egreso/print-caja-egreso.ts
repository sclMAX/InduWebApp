import {CajaEgreso} from './../../../../models/fondos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-print-caja-egreso',
  templateUrl: 'print-caja-egreso.html',
})
export class PrintCajaEgresoPage {
  isPrint: boolean = false;
  egreso: CajaEgreso;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.egreso = this.navParams.get('Egreso');
    if (!this.egreso) {
      this.navCtrl.pop();
    }
  }

  calTotalCheques(): number {
    let total: number = 0.00;
    if (this.egreso.Cheques) {
      this.egreso.Cheques.forEach((c) => { total += Number(c.monto || 0); });
    }
    return total;
  }

  calTotalEgreso():number{
    let total:number = 0.00;
    total = Number(this.egreso.efectivo) + Number(this.calTotalCheques());
    return total;
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
