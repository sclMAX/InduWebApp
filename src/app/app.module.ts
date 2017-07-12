import { LoginPage } from './../pages/login/login';
import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import { ClientesProvider } from '../providers/clientes/clientes';
import { SucursalProvider } from '../providers/sucursal/sucursal';
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyD7zoKlOj8l12BHBMqgUI4IT2TfcPoG4Z4",
    authDomain: "indumaticsapp.firebaseapp.com",
    databaseURL: "https://indumaticsapp.firebaseio.com",
    projectId: "indumaticsapp",
    storageBucket: "indumaticsapp.appspot.com",
    messagingSenderId: "293106198530"
  }
};

@NgModule({
  declarations: [MyApp, HomePage, LoginPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage, LoginPage],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ClientesProvider,
    SucursalProvider
  ]
})
export class AppModule {


}
