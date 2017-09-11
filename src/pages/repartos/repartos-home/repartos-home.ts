import { CtasCtesProvider } from './../../../providers/ctas-ctes/ctas-ctes';
import { ClientesProvider } from './../../../providers/clientes/clientes';
import {
  PrintRepartoPage
} from './../../documentos/print/print-reparto/print-reparto';
import { Reparto } from './../../../models/repartos.clases';
import { RepartoAmPage } from './../reparto-am/reparto-am';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { printReparto } from '../../../print/print-repartos';

@Component({
  selector: 'page-repartos-home',
  templateUrl: 'repartos-home.html',
})
export class RepartosHomePage {
  constructor(public navCtrl: NavController, public navParams: NavParams, private clientesP: ClientesProvider, private ctacteP: CtasCtesProvider) { }

  onSelectPreparado(item: Reparto) {
    this.navCtrl.push(RepartoAmPage, { Reparto: item });
  }

  onSelectEnProceso(item: Reparto) {
    // this.navCtrl.push(PrintRepartoPage, {Reparto: item});
    printReparto(item, this.clientesP, this.ctacteP);
  }
  nuevoReparto() { this.navCtrl.push(RepartoAmPage); }
}
