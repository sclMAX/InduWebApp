import { BancosamPage } from './../bancosam/bancosam';
import {DolarProvider} from './../../../providers/dolar/dolar';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-fondos-home',
  templateUrl: 'fondos-home.html',
})
export class FondosHomePage {
  dolar:number;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private dolarP: DolarProvider) {
                this.dolarP.getDolarValor().subscribe((val)=>{
                  this.dolar = val;
                });
              }

  ionViewDidLoad() {}

  addBanco(){
    this.navCtrl.push(BancosamPage);
  }

  setDolar(valor: number) {
    this.dolarP.setDolar(valor).subscribe();
  }
}
