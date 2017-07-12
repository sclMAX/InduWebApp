import { User } from './../../models/user.class';
import {AngularFireAuth} from 'angularfire2/auth';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user: User = new User();
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private auth: AngularFireAuth) {
  }

  login() {
    this.auth.auth.signInWithEmailAndPassword(this.user.email, this.user.password);
  }
}

