import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {SUCURSAL} from './../../providers/sucursal/sucursal';
import {UsuarioProvider} from './../../providers/usuario/usuario';
import {ClientesPage} from './../clientes/clientes';
import {LoginPage} from './../login/login';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string = SUCURSAL;

  constructor(
      public navCtrl: NavController, private usuarioP: UsuarioProvider) {}

  logOut() {
    this.usuarioP.logOut().then(() => {
      this.navCtrl.setRoot(LoginPage);
    });
  }

  goClientes() {
    this.navCtrl.push(ClientesPage);
  }

  // ionViewDidEnter() { this.title = currentSucursal; }
}
