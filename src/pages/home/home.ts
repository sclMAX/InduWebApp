import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {SUCURSAL} from './../../providers/sucursal/sucursal';
import {UsuarioProvider} from './../../providers/usuario/usuario';
import {ClientesHomePage} from './../clientes/clientes-home/clientes-home';
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
    this.navCtrl.push(ClientesHomePage);
  }

  // ionViewDidEnter() { this.title = currentSucursal; }
}
