import { Cheque } from './../../../models/fondos.clases';
import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-cheques-en-cartera-find-and-select',
  templateUrl: 'cheques-en-cartera-find-and-select.html',
})
export class ChequesEnCarteraFindAndSelectPage {
  cheques:Cheque [];
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.cheques = this.navParams.get('Cheques');
  }

  onSelectCheque(cheque){
    this.viewCtrl.dismiss(cheque);
  }

  goBack(){
    this.viewCtrl.dismiss();
  }
}
