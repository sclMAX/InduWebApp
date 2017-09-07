import {CajaMovimiento} from './../../../../models/fondos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {FECHA} from '../../../../models/comunes.clases';


@Component({
  selector: 'page-print-movimiento-caja',
  templateUrl: 'print-movimiento-caja.html',
})
export class PrintMovimientoCajaPage {
  isPrint: boolean = false;
  fecha: string = moment().format(FECHA);
  movimientos: CajaMovimiento[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.movimientos = this.navParams.get('Movimientos');
    if (!this.movimientos) {
      this.navCtrl.pop();
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
}
