import {ChequeRechazarPage} from './../pages/fondos/cheques/cheque-rechazar/cheque-rechazar';
import {
  RepartosCardComponent
} from './../components/repartos/repartos-card/repartos-card';
import {environment} from './environment';
import {
  PedidosCanceladosCardComponent
} from './../components/pedidos/pedidos-cancelados-card/pedidos-cancelados-card';
import {
  RepartoCerrarPage
} from './../pages/repartos/reparto-cerrar/reparto-cerrar';
import {
  RepartoEnProcesoPage
} from './../pages/repartos/reparto-en-proceso/reparto-en-proceso';
import {RepartoAmPage} from './../pages/repartos/reparto-am/reparto-am';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireModule} from 'angularfire2';
import {
  PrintCajaEgresoPage
} from './../pages/documentos/print/print-caja-egreso/print-caja-egreso';
import {
  ChequesEnCarteraFindAndSelectPage
} from './../pages/fondos/cheques-en-cartera-find-and-select/cheques-en-cartera-find-and-select';
import {CajaEgresoPage} from './../pages/fondos/caja-egreso/caja-egreso';
import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {
  BancosCardComponent
} from '../components/bancos/bancos-card/bancos-card';
import {
  BancosListComponent
} from '../components/bancos/bancos-list/bancos-list';
import {
  BancosSearchBarComponent
} from '../components/bancos/bancos-search-bar/bancos-search-bar';
import {
  BancosSucursalesListComponent
} from '../components/bancos/bancos-sucursales-list/bancos-sucursales-list';
import {
  ClienteActionToolBarComponent
} from '../components/clientes/cliente-action-tool-bar/cliente-action-tool-bar';
import {
  ClienteCtaCteCardComponent
} from '../components/clientes/cliente-cta-cte-card/cliente-cta-cte-card';
import {
  ClienteListItemContentComponent
} from '../components/clientes/cliente-list-item-content/cliente-list-item-content';
import {
  ColoresFindAndSelectComponent
} from '../components/comunes/colores-find-and-select/colores-find-and-select';
import {
  DireccionEditItemComponent
} from '../components/comunes/direccion-edit-item/direccion-edit-item';
import {
  FooterComunComponent
} from '../components/comunes/footer-comun/footer-comun';
import {
  FormBadgeInputItemComponent
} from '../components/comunes/form-badge-input-item/form-badge-input-item';
import {
  FormBadgeItemComponent
} from '../components/comunes/form-badge-item/form-badge-item';
import {
  CajaMovimientosCardComponent
} from '../components/fondos/caja-movimientos-card/caja-movimientos-card';
import {
  ChequesEnCarteraCardComponent
} from '../components/fondos/cheques-en-cartera-card/cheques-en-cartera-card';
import {DolarCardComponent} from '../components/fondos/dolar-card/dolar-card';
import {
  LineasFindAndSelectComponent
} from '../components/lineas-find-and-select/lineas-find-and-select';
import {
  PedidoHeaderAddItemComponent
} from '../components/pedidos/pedido-header-add-item/pedido-header-add-item';
import {
  PedidoHeaderEditComponent
} from '../components/pedidos/pedido-header-edit/pedido-header-edit';
import {
  PedidoHeaderComponent
} from '../components/pedidos/pedido-header/pedido-header';
import {
  PedidoItemsItemComponent
} from '../components/pedidos/pedido-items-item/pedido-items-item';
import {
  PedidosEntregadosCardComponent
} from '../components/pedidos/pedidos-entregados-card/pedidos-entregados-card';
import {
  PedidosPendientesCardComponent
} from '../components/pedidos/pedidos-pendientes-card/pedidos-pendientes-card';
import {
  PedidosPorEntregarCardComponent
} from '../components/pedidos/pedidos-por-entregar-card/pedidos-por-entregar-card';
import {
  PresupuestosCardComponent
} from '../components/pedidos/presupuestos-card/presupuestos-card';
import {
  PerfilesFindAndSelectComponent
} from '../components/perfiles/perfiles-find-and-select/perfiles-find-and-select';
import {
  PerfilesListComponent
} from '../components/perfiles/perfiles-list/perfiles-list';
import {
  PerfilesPerfilImgComponent
} from '../components/perfiles/perfiles-perfil-img/perfiles-perfil-img';
import {
  PerfilesSearchBarComponent
} from '../components/perfiles/perfiles-search-bar/perfiles-search-bar';
import {
  StockIngresoAddItemComponent
} from '../components/stock/stock-ingreso-add-item/stock-ingreso-add-item';
import {HomePage} from '../pages/home/home';
import {AdicionalesProvider} from '../providers/adicionales/adicionales';
import {BancosProvider} from '../providers/bancos/bancos';
import {ClientesProvider} from '../providers/clientes/clientes';
import {ColoresProvider} from '../providers/colores/colores';
import {ContadoresProvider} from '../providers/contadores/contadores';
import {CtasCtesProvider} from '../providers/ctas-ctes/ctas-ctes';
import {DescuentosProvider} from '../providers/descuentos/descuentos';
import {DolarProvider} from '../providers/dolar/dolar';
import {FondosProvider} from '../providers/fondos/fondos';
import {LogProvider} from '../providers/log/log';
import {PagosProvider} from '../providers/pagos/pagos';
import {PedidosProvider} from '../providers/pedidos/pedidos';
import {ProductosProvider} from '../providers/productos/productos';
import {StockProvider} from '../providers/stock/stock';
import {SucursalProvider} from '../providers/sucursal/sucursal';
import {UsuarioProvider} from '../providers/usuario/usuario';

import {
  ClientesAddDescuentoPage
} from './../pages/clientes/clientes-add-descuento/clientes-add-descuento';
import {
  ClientesAddPagoPage
} from './../pages/clientes/clientes-add-pago/clientes-add-pago';
import {ClientesAddPage} from './../pages/clientes/clientes-add/clientes-add';
import {
  ClientesDetallePage
} from './../pages/clientes/clientes-detalle/clientes-detalle';
import {
  ClientesHomePage
} from './../pages/clientes/clientes-home/clientes-home';
import {
  PedidosEmbalarPage
} from './../pages/documentos/pedidos/pedidos-embalar/pedidos-embalar';
import {
  PedidosEntregarPage
} from './../pages/documentos/pedidos/pedidos-entregar/pedidos-entregar';
import {
  PedidosNewPage
} from './../pages/documentos/pedidos/pedidos-new/pedidos-new';
import {
  PrintChequesEnCarteraPage
} from './../pages/documentos/print/print-cheques-en-cartera/print-cheques-en-cartera';
import {
  PrintCtacteCardPage
} from './../pages/documentos/print/print-ctacte-card/print-ctacte-card';
import {PrintPagoPage} from './../pages/documentos/print/print-pago/print-pago';
import {
  StockIngresoPage
} from './../pages/documentos/stock/stock-ingreso/stock-ingreso';
import {
  BancosSucursalAmPage
} from './../pages/fondos/bancos/bancos-sucursal-am/bancos-sucursal-am';
import {BancosamPage} from './../pages/fondos/bancos/bancosam/bancosam';
import {ChequesAmPage} from './../pages/fondos/cheques/cheques-am/cheques-am';
import {FondosHomePage} from './../pages/fondos/fondos-home/fondos-home';
import {LoginPage} from './../pages/login/login';
import {
  ProductosHomePage
} from './../pages/productos/productos-home/productos-home';
import {
  ProductosPerfilesListPage
} from './../pages/productos/productos-perfiles-list/productos-perfiles-list';
import {
  RepartosHomePage
} from './../pages/repartos/repartos-home/repartos-home';
import {MyApp} from './app.component';
import {ToolTipDirective} from '../directives/tool-tip/tool-tip';
import {
  ChequesEntregadosCardComponent
} from '../components/fondos/cheques-entregados-card/cheques-entregados-card';
import {RepartosProvider} from '../providers/repartos/repartos';
import {HelpProvider} from '../providers/help/help';
import {HelpPanelComponent} from '../components/comunes/help-panel/help-panel';
import {
  ClientesConSaldoCardComponent
} from '../components/clientes/clientes-con-saldo-card/clientes-con-saldo-card';
import {
  StockIngresosCardComponent
} from '../components/stock/stock-ingresos-card/stock-ingresos-card';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ClientesHomePage,
    ClientesAddPage,
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
    PedidosPendientesCardComponent,
    PedidosEmbalarPage,
    PerfilesPerfilImgComponent,
    PedidosPorEntregarCardComponent,
    PedidosEntregadosCardComponent,
    PedidosCanceladosCardComponent,
    ClientesAddDescuentoPage,
    LineasFindAndSelectComponent,
    StockIngresoPage,
    StockIngresoAddItemComponent,
    PedidosEntregarPage,
    PedidoHeaderComponent,
    ClienteCtaCteCardComponent,
    BancosSearchBarComponent,
    BancosListComponent,
    BancosSucursalesListComponent,
    BancosamPage,
    DireccionEditItemComponent,
    BancosSucursalAmPage,
    BancosCardComponent,
    ChequesAmPage,
    ClientesAddPagoPage,
    FormBadgeItemComponent,
    FormBadgeInputItemComponent,
    PrintCtacteCardPage,
    PresupuestosCardComponent,
    PrintPagoPage,
    DolarCardComponent,
    ChequesEnCarteraCardComponent,
    PrintChequesEnCarteraPage,
    CajaMovimientosCardComponent,
    CajaEgresoPage,
    ToolTipDirective,
    ChequesEnCarteraFindAndSelectPage,
    PrintCajaEgresoPage,
    ChequesEntregadosCardComponent,
    RepartoAmPage,
    HelpPanelComponent,
    ClientesConSaldoCardComponent,
    RepartoEnProcesoPage,
    RepartoCerrarPage,
    StockIngresosCardComponent,
    RepartosCardComponent,
    ChequeRechazarPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    ClientesHomePage,
    ClientesAddPage,
    ProductosHomePage,
    RepartosHomePage,
    FondosHomePage,
    ProductosPerfilesListPage,
    PedidosNewPage,
    PerfilesFindAndSelectComponent,
    ColoresFindAndSelectComponent,
    ClientesDetallePage,
    PedidosEmbalarPage,
    ClientesAddDescuentoPage,
    LineasFindAndSelectComponent,
    StockIngresoPage,
    PedidosEntregarPage,
    BancosamPage,
    BancosSucursalAmPage,
    ChequesAmPage,
    ClientesAddPagoPage,
    PrintCtacteCardPage,
    PrintPagoPage,
    PrintChequesEnCarteraPage,
    CajaEgresoPage,
    ChequesEnCarteraFindAndSelectPage,
    PrintCajaEgresoPage,
    RepartoAmPage,
    RepartoEnProcesoPage,
    RepartoCerrarPage,
    ChequeRechazarPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ClientesProvider,
    SucursalProvider,
    UsuarioProvider,
    ProductosProvider,
    ColoresProvider,
    PedidosProvider,
    DolarProvider,
    StockProvider,
    AdicionalesProvider,
    DescuentosProvider,
    CtasCtesProvider,
    BancosProvider,
    PagosProvider,
    ContadoresProvider,
    LogProvider,
    FondosProvider,
    RepartosProvider,
    HelpProvider
  ]
})
export class AppModule {
}
