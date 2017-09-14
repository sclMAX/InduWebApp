import {RepartoCerrarPage} from './../reparto-cerrar/reparto-cerrar';
import {Reparto} from './../../../models/repartos.clases';
import {RepartoAmPage} from './../reparto-am/reparto-am';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-repartos-home',
  templateUrl: 'repartos-home.html',
})
export class RepartosHomePage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  onSelectPreparado(item: Reparto) {
    this.navCtrl.push(RepartoAmPage, {Reparto: item});
  }

  onSelectEnProceso(item: Reparto) {
    // this.navCtrl.push(PrintRepartoPage, {Reparto: item});
    // printReparto(item, this.clientesP, this.ctacteP);
    this.navCtrl.push(RepartoCerrarPage, {Reparto: item});
  }
  nuevoReparto() { this.navCtrl.push(RepartoAmPage); }
}
