import {Cliente} from './../../models/cliente.class';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {LoginPage} from './../login/login';
import {currentSucursal} from './../../providers/sucursal/sucursal';
import {AngularFireAuth} from 'angularfire2/auth';
import {Component} from '@angular/core';
import {NavController, LoadingController, ToastController} from 'ionic-angular';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string;
  clientes: Cliente[];
  constructor(public navCtrl: NavController, private auth: AngularFireAuth,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController,
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
            let toast = this.toastCtrl.create({duration:1000,message:`Error: ${error}`});
            toast.present();

          },
          () => { load.dismiss(); });
    });
  }
  ionViewDidEnter() { this.title = currentSucursal; }
}
