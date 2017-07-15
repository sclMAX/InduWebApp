import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {LoadingController, NavController, ToastController} from 'ionic-angular';

import {Cliente} from './../../models/cliente.class';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {SUCURSAL} from './../../providers/sucursal/sucursal';
import {ClientesPage} from './../clientes/clientes';
import {LoginPage} from './../login/login';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string = SUCURSAL;
  clientes: Cliente[];

  constructor(
      public navCtrl: NavController, private auth: AngularFireAuth,
      private clientesP: ClientesProvider, private loadCtrl: LoadingController,
      private toastCtrl: ToastController) {}

  logOut() {
    this.auth.auth.signOut();
    this.navCtrl.setRoot(LoginPage);
  }

  goClientes() {
    this.navCtrl.push(ClientesPage);
  }

  // ionViewDidEnter() { this.title = currentSucursal; }
}
