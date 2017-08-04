import {Banco} from './../../../models/fondos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-bancosam',
  templateUrl: 'bancosam.html',
})
export class BancosamPage {
  newBanco: Banco;
  oldBanco: Banco;
  isEdit: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.oldBanco = this.navParams.get('Banco');
    if (this.oldBanco) {
      this.isEdit = true;
      this.newBanco = JSON.parse(JSON.stringify(this.oldBanco));
    } else {
      this.isEdit = false;
      this.newBanco = new Banco();
    }
  }

  guardar(){

  }


}
