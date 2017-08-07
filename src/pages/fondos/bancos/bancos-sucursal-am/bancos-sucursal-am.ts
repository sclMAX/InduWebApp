import { Banco } from './../../../../models/fondos.clases';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-bancos-sucursal-am',
  templateUrl: 'bancos-sucursal-am.html',
})
export class BancosSucursalAmPage {
  banco:Banco;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
}
