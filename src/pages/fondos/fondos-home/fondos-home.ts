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
  constructor(public navCtrl: NavController, public navParams: NavParams, ) {}

  goEgreso(isEgreso:boolean) { this.navCtrl.push(CajaEgresoPage, {isEgreso: isEgreso}); }

  onSelectCheque(cheque) { this.navCtrl.push(ChequesAmPage, {Cheque: cheque}); }
}
