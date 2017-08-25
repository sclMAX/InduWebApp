import { RepartoAmPage } from './../reparto-am/reparto-am';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-repartos-home',
  templateUrl: 'repartos-home.html',
})
export class RepartosHomePage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  nuevoReparto(){
    this.navCtrl.push(RepartoAmPage);
  }
}
