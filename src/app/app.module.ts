import {ErrorHandler, NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {ClienteActionToolBarComponent} from '../components/cliente-action-tool-bar/cliente-action-tool-bar';
import {ClienteListItemContentComponent} from '../components/cliente-list-item-content/cliente-list-item-content';
import {ColoresFindAndSelectComponent} from '../components/colores-find-and-select/colores-find-and-select';
import {FooterComunComponent} from '../components/footer-comun/footer-comun';
import {PedidoHeaderAddItemComponent} from '../components/pedido-header-add-item/pedido-header-add-item';
import {PedidoHeaderEditComponent} from '../components/pedido-header-edit/pedido-header-edit';
import {PedidoItemsItemComponent} from '../components/pedido-items-item/pedido-items-item';
import {PedidosPendientesCardComponent} from '../components/pedidos-pendientes-card/pedidos-pendientes-card';
import {PerfilesFindAndSelectComponent} from '../components/perfiles-find-and-select/perfiles-find-and-select';
import {PerfilesListComponent} from '../components/perfiles-list/perfiles-list';
import {PerfilesSearchBarComponent} from '../components/perfiles-search-bar/perfiles-search-bar';
import {HomePage} from '../pages/home/home';
import {ClientesProvider} from '../providers/clientes/clientes';
import {ColoresProvider} from '../providers/colores/colores';
import {DolarProvider} from '../providers/dolar/dolar';
import {ProductosProvider} from '../providers/productos/productos';
import {StockProvider} from '../providers/stock/stock';
import {SucursalPedidosProvider} from '../providers/sucursal-pedidos/sucursal-pedidos';
import {SucursalProvider} from '../providers/sucursal/sucursal';
import {UsuarioProvider} from '../providers/usuario/usuario';

import {ClientesAddPage} from './../pages/clientes/clientes-add/clientes-add';
import {ClientesDetallePage} from './../pages/clientes/clientes-detalle/clientes-detalle';
import {ClientesHomePage} from './../pages/clientes/clientes-home/clientes-home';
import {DocumentosAddPage} from './../pages/documentos/documentos-add/documentos-add';
import {PedidosNewPage} from './../pages/documentos/pedidos/pedidos-new/pedidos-new';
import {FondosHomePage} from './../pages/fondos/fondos-home/fondos-home';
import {LoginPage} from './../pages/login/login';
import {ProductosHomePage} from './../pages/productos/productos-home/productos-home';
import {ProductosPerfilesListPage} from './../pages/productos/productos-perfiles-list/productos-perfiles-list';
import {RepartosHomePage} from './../pages/repartos/repartos-home/repartos-home';
import {MyApp} from './app.component';

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyD7zoKlOj8l12BHBMqgUI4IT2TfcPoG4Z4',
    authDomain: 'indumaticsapp.firebaseapp.com',
    databaseURL: 'https://indumaticsapp.firebaseio.com',
    projectId: 'indumaticsapp',
    storageBucket: 'indumaticsapp.appspot.com',
    messagingSenderId: '293106198530'
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
    ProductosPerfilesListPage,
    PedidosNewPage,
    PedidoHeaderEditComponent,
    PedidoHeaderAddItemComponent,
    PerfilesFindAndSelectComponent,
    ColoresFindAndSelectComponent,
    PedidoItemsItemComponent,
    ClientesDetallePage,
    PedidosPendientesCardComponent
  ],
  imports: [
    BrowserModule, IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule, AngularFireAuthModule, HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, HomePage, LoginPage, ClientesHomePage, ClientesAddPage,
    DocumentosAddPage, ProductosHomePage, RepartosHomePage, FondosHomePage,
    ProductosPerfilesListPage, PedidosNewPage, PerfilesFindAndSelectComponent,
    ColoresFindAndSelectComponent, ClientesDetallePage
  ],
  providers: [
    StatusBar, SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}, ClientesProvider,
    SucursalProvider, UsuarioProvider, ProductosProvider, ColoresProvider,
    SucursalPedidosProvider, DolarProvider, StockProvider
  ]
})
export class AppModule {
}
