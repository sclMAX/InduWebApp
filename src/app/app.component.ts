import {Component} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {LoadingController, Platform} from 'ionic-angular';
import {UsuarioProvider} from '../providers/usuario/usuario';
import {HomePage} from './../pages/home/home';
import {LoginPage} from './../pages/login/login';
import {SucursalProvider} from './../providers/sucursal/sucursal';


@Component({templateUrl: 'app.html'})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform, auth: AngularFireAuth,
              sp: SucursalProvider, up: UsuarioProvider,
              loadCtrl: LoadingController) {
    platform.ready().then(() => {
      let load = loadCtrl.create({content: 'Conectando con el Servidor...'});
      load.present().then(() => {
        auth.authState.subscribe(user => {
          if (!user) {
            load.dismiss();
            this.rootPage = LoginPage;
          } else {
            sp.setSucursal().subscribe(
                (sucursal) => {
                  load.dismiss();
                  this.rootPage = HomePage;
                },
                (error) => {
                  load.dismiss();
                  up.logOut();
                  this.rootPage = LoginPage;
                });
          }
        });
      });
    });

    /* --prod
    platform.pause.subscribe(()=>{
      up.logOut();
    });
    window.addEventListener('beforeunload', () => {
      up.logOut();
    }); /**/
  }
}
