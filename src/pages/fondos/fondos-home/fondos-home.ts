import { SUCURSAL } from './../../../providers/sucursal/sucursal';
import {ChequesAmPage} from './../cheques/cheques-am/cheques-am';
import {CajaEgresoPage} from './../caja-egreso/caja-egreso';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-fondos-home',
  templateUrl: 'fondos-home.html',
})
export class FondosHomePage {
  dolar: number;
  title:string;
  constructor(public navCtrl: NavController, public navParams: NavParams ) {
    this.title = `Suc. ${SUCURSAL} - Fondos`;
  }

  goEgreso(isEgreso:boolean) { this.navCtrl.push(CajaEgresoPage, {isEgreso: isEgreso}); }

  onSelectCheque(cheque) { this.navCtrl.push(ChequesAmPage, {Cheque: cheque}); }
}
