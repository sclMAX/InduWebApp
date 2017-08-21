import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';

import {FECHA} from '../../../../models/comunes.clases';
import {CajaItem, Saldos} from '../../../../models/fondos.clases';


@Component({
  selector: 'page-print-movimiento-caja',
  templateUrl: 'print-movimiento-caja.html',
})
export class PrintMovimientoCajaPage {
  isPrint: boolean = false;
  fecha: string = moment().format(FECHA);
  movimientos: CajaItem[] = [];
  saldos: Saldos[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.movimientos = this.navParams.get('Movimientos');
    if (!this.movimientos) {
      this.navCtrl.pop();
    } else {
      this.calSaldos(this.movimientos);
    }
  }
  private calSaldos(data: CajaItem[]) {
    let sE: number = 0.00;
    let sD: number = 0.00;
    let sC: number = 0.00;
    data.forEach((i) => {
      sE += (i.isIngreso) ? (i.efectivo * 1) : (i.efectivo * -1);
      sD += (i.isIngreso) ? (i.dolares * 1) : (i.dolares * -1);
      sC += (i.isIngreso) ? (i.cheques * 1) : (i.cheques * -1);
      this.saldos.push({saldoEfectivo: sE, saldoDolares: sD, saldoCheques: sC});
    });
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }

  goBack() {
    this.navCtrl.pop();
  }
}
