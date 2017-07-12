import {
  SucursalProvider,
  currentSucursal
} from './../../providers/sucursal/sucursal';
import {AngularFireAuth} from 'angularfire2/auth';
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string;
  constructor(public navCtrl: NavController, private auth: AngularFireAuth) {}

  logOut() { this.auth.auth.signOut(); }

  pruebaGuarda() {}
  ionViewDidEnter() { this.title = currentSucursal; }
}
