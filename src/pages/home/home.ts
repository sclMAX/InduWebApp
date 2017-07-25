import {Usuario} from './../../models/user.class';
import {FondosHomePage} from './../fondos/fondos-home/fondos-home';
import {RepartosHomePage} from './../repartos/repartos-home/repartos-home';
import {ProductosHomePage} from './../productos/productos-home/productos-home';
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {SUCURSAL} from './../../providers/sucursal/sucursal';
import {UsuarioProvider} from './../../providers/usuario/usuario';
import {ClientesHomePage} from './../clientes/clientes-home/clientes-home';
import {LoginPage} from './../login/login';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string = SUCURSAL;
  usuario: Usuario;

  constructor(public navCtrl: NavController,
              private usuarioP: UsuarioProvider) {
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }

  public logOut() {
    this.usuarioP.logOut().then(() => { this.navCtrl.setRoot(LoginPage); });
  }

  public goClientes() { this.navCtrl.push(ClientesHomePage); }

  public goProductos() { this.navCtrl.push(ProductosHomePage); }

  public goRespartos() { this.navCtrl.push(RepartosHomePage); }

  public goFondos() { this.navCtrl.push(FondosHomePage); }
}
