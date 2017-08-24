import { Component } from '@angular/core';
import {
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import { UsuarioProvider } from '../../providers/usuario/usuario';
import { HomePage } from '../home/home';
import { UserLogin } from './../../models/user.class';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user: UserLogin = new UserLogin();
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private toastCtrl: ToastController,
    private loadCtrl: LoadingController,
    private usuarioP: UsuarioProvider) { }

  login() {
    let load = this.loadCtrl.create({
      content: 'Conectando con el Servidor...',
    });
    load.present().then(() => {
      this.usuarioP.login(this.user).subscribe(
        (usuario) => {
          load.dismiss().then(() => { this.navCtrl.setRoot(HomePage); });
        },
        (error) => {
          load.dismiss();
          let toast = this.toastCtrl.create(
            { position: 'middle', duration: 2000, dismissOnPageChange: true, message: error });
          toast.present();
        });
    });
  }
}
