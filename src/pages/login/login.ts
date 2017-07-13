import {User} from './../../models/user.class';
import {AngularFireAuth} from 'angularfire2/auth';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  ToastController,
  LoadingController
} from 'ionic-angular';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user: User = new User();
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private auth: AngularFireAuth, private toastCtrl: ToastController,
              private loadCtrl: LoadingController) {}

  login() {
    let load = this.loadCtrl.create({
      content: 'Conectacndo con el Servidor...',
    });
    load.present().then(() => {
      this.auth.auth.signInWithEmailAndPassword(this.user.email,
                                                this.user.password)
          .then(() => { load.dismiss(); })
          .catch(error => {
            load.dismiss();
            let toast = this.toastCtrl.create({
              message: `E-Mail y/o Password incorrectos... (${error.message})`,
              showCloseButton: true,
              position: 'middle'
            });
            toast.onDidDismiss(() => {
              this.user.password = '';
              this.user.email = '';
            });
            toast.present();
          });

    });
  }
}
