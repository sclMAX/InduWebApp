import {FondosHomePage} from './../pages/fondos/fondos-home/fondos-home';
import {
  RepartosHomePage
} from './../pages/repartos/repartos-home/repartos-home';
import {
  ProductosHomePage
} from './../pages/productos/productos-home/productos-home';
import {
  DocumentosAddPage
} from './../pages/clientes/documentos-add/documentos-add';
import {ClientesAddPage} from './../pages/clientes/clientes-add/clientes-add';
import {
  ClientesHomePage
} from './../pages/clientes/clientes-home/clientes-home';
import {LoginPage} from './../pages/login/login';
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
import {ClientesProvider} from '../providers/clientes/clientes';
import {SucursalProvider} from '../providers/sucursal/sucursal';
import {UsuarioProvider} from '../providers/usuario/usuario';
import {
  ClienteActionToolBarComponent
} from '../components/cliente-action-tool-bar/cliente-action-tool-bar';
import {
  ClienteListItemContentComponent
} from '../components/cliente-list-item-content/cliente-list-item-content';
import {ProductosProvider} from '../providers/productos/productos';
import {FooterComunComponent} from '../components/footer-comun/footer-comun';
import {
  PerfilesSearchBarComponent
} from '../components/perfiles-search-bar/perfiles-search-bar';
import {PerfilesListComponent} from '../components/perfiles-list/perfiles-list';
import {HttpModule} from '@angular/http';

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
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ClientesHomePage,
    ClientesAddPage,
    DocumentosAddPage,
    ClienteActionToolBarComponent,
    ClienteListItemContentComponent,
    ProductosHomePage,
    RepartosHomePage,
    FondosHomePage,
    FooterComunComponent,
    PerfilesSearchBarComponent,
    PerfilesListComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    ClientesHomePage,
    ClientesAddPage,
    DocumentosAddPage,
    ProductosHomePage,
    RepartosHomePage,
    FondosHomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ClientesProvider,
    SucursalProvider,
    UsuarioProvider,
    ProductosProvider
  ]
})
export class AppModule {
}
