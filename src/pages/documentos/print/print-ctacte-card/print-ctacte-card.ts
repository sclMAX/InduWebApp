import {FECHA} from './../../../../models/comunes.clases';
import {CtaCte, Cliente} from './../../../../models/clientes.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';

@Component({
  selector: 'page-print-ctacte-card',
  templateUrl: 'print-ctacte-card.html',
})
export class PrintCtacteCardPage {
  isPrint: boolean = false;
  ctaCte: CtaCte[] = [];
  cliente: Cliente;
  fecha: string = moment().format(FECHA);
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.ctaCte = this.navParams.get('CtaCte');
    this.cliente = this.navParams.get('Cliente');
    if (this.ctaCte && this.cliente) {
    } else {
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
