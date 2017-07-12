import {SucursalProvider} from './../providers/sucursal/sucursal';
import {HomePage} from './../pages/home/home';
import {LoginPage} from './../pages/login/login';
import {AngularFireAuth} from 'angularfire2/auth';
import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';


@Component({templateUrl: 'app.html'})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform, statusBar: StatusBar,
              splashScreen: SplashScreen, auth: AngularFireAuth,
              sp: SucursalProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      auth.authState.subscribe(user => {
        if (!user) {
          this.rootPage = LoginPage;
        } else {
          sp.getSucursal().subscribe(suc => { this.rootPage = HomePage; },
                                     error => { this.rootPage = LoginPage; });
        }
      })

    });
  }
}