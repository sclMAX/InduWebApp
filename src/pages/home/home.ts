import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {LoadingController, NavController, ToastController} from 'ionic-angular';

import {Cliente} from './../../models/cliente.class';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {currentSucursal} from './../../providers/sucursal/sucursal';
import {LoginPage} from './../login/login';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string;
  nombre: string;
  clientes: Cliente[];
  constructor(
      public navCtrl: NavController, private auth: AngularFireAuth,
      private clientesP: ClientesProvider, private loadCtrl: LoadingController,
      private toastCtrl: ToastController) {}

  logOut() {
    this.auth.auth.signOut();
    this.navCtrl.setRoot(LoginPage);
  }

  pruebaCliente() {
    let load = this.loadCtrl.create({content: 'Buscando Clientes...'});
    load.present().then(() => {
      this.clientesP.Clientes.subscribe(
          clientes => {
            this.clientes = clientes;
            load.dismiss();
          },
          error => {
            load.dismiss();
            let toast = this.toastCtrl.create(
                {duration: 1000, message: `Error: ${error}`});
            toast.present();

          },
          () => {
            load.dismiss();
          });
    });
  }

  goAdd() {
    if (this.nombre) {
      let c = new Cliente();
      c.Nombre = this.nombre;
      this.clientesP.add(c).subscribe(
          val => {
            console.log('OK Result:', val);
          },
          error => {
            console.log('ERROR Result:', error);
          });
    }
  }

  ionViewDidEnter() {
    this.title = currentSucursal;
  }
}
