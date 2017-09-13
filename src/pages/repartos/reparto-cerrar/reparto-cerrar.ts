import {Reparto} from './../../../models/repartos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {numFormat} from '../../../print/config-comun';

@Component({
  selector: 'page-reparto-cerrar',
  templateUrl: 'reparto-cerrar.html',
})
export class RepartoCerrarPage {
  private oldReparto: Reparto;
  reparto: Reparto;
  title: string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.oldReparto = this.navParams.get('Reparto');
    if (this.oldReparto) {
      this.reparto = JSON.parse(JSON.stringify(this.oldReparto));
      this.title = `Reparto Nro ${numFormat(this.reparto.id, '3.0-0')}`;
    } else {
      this.goBack();
    }
  }

  goBack() { this.navCtrl.pop(); }
}
