import {Component} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {AngularFireAuth} from 'angularfire2/auth';
import {Platform, ToastController} from 'ionic-angular';

import {UsuarioProvider} from '../providers/usuario/usuario';

import {HomePage} from './../pages/home/home';
import {LoginPage} from './../pages/login/login';
import {SucursalProvider} from './../providers/sucursal/sucursal';


@Component({templateUrl: 'app.html'})
export class MyApp {
  rootPage: any;

  constructor(
      platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
      auth: AngularFireAuth, sp: SucursalProvider, up: UsuarioProvider,
      toastCtrl: ToastController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      auth.authState.subscribe(user => {
        if (!user) {
          this.rootPage = LoginPage;
        } else {
          sp.setSucursal().subscribe(
              (sucursal) => {
                this.rootPage = HomePage;
              },
              (error) => {
                up.logOut().then(() => {
                  this.rootPage = LoginPage;
                });
              });
        }
      })

    });
  }
}
