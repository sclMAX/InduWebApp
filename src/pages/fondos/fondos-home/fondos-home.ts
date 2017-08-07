import { ChequesAmPage } from './../cheques/cheques-am/cheques-am';
import {DolarProvider} from './../../../providers/dolar/dolar';
import {Component} from '@angular/core';
import {NavController, NavParams, ModalController} from 'ionic-angular';

@Component({
  selector: 'page-fondos-home',
  templateUrl: 'fondos-home.html',
})
export class FondosHomePage {
  dolar: number;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private dolarP: DolarProvider,
              private modalCtrl: ModalController) {
    this.dolarP.getDolarValor().subscribe((val) => { this.dolar = val; });
  }

  ionViewDidLoad() {}

  add() {
    let newCheque = this.modalCtrl.create(ChequesAmPage,{},{enableBackdropDismiss:false});
    newCheque.present();
   }

  setDolar(valor: number) { this.dolarP.setDolar(valor).subscribe(); }
}
