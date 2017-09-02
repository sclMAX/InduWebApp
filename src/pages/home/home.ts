import {RepartoAmPage} from './../repartos/reparto-am/reparto-am';
import {ChequesAmPage} from './../fondos/cheques/cheques-am/cheques-am';
import {PRESUPUESTO} from './../../models/pedidos.clases';
import {PedidosNewPage} from './../documentos/pedidos/pedidos-new/pedidos-new';
import {Usuario} from './../../models/user.class';
import {FondosHomePage} from './../fondos/fondos-home/fondos-home';
import {RepartosHomePage} from './../repartos/repartos-home/repartos-home';
import {ProductosHomePage} from './../productos/productos-home/productos-home';
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {SUCURSAL} from './../../providers/sucursal/sucursal';
import {UsuarioProvider} from './../../providers/usuario/usuario';
import {ClientesHomePage} from './../clientes/clientes-home/clientes-home';
import {LoginPage} from './../login/login';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string = SUCURSAL;
  usuario: Usuario = new Usuario();
  isLogin: boolean = true;
  isChequesPorVencer: boolean;

  constructor(public navCtrl: NavController,
              private usuarioP: UsuarioProvider) {}

  public logOut() {
    this.isLogin = false;
    this.navCtrl.setRoot(LoginPage);
    this.usuarioP.logOut();
  }

  goClientes() { this.navCtrl.push(ClientesHomePage); }

  goProductos() { this.navCtrl.push(ProductosHomePage); }

  goRespartos() { this.navCtrl.push(RepartosHomePage); }

  goFondos() { this.navCtrl.push(FondosHomePage); }

  onClickPresupuestosItem(item) {
    this.navCtrl.push(PedidosNewPage, {Pedido: item, tipo: PRESUPUESTO});
  }
  onSelectCheque(cheque) { this.navCtrl.push(ChequesAmPage, {Cheque: cheque}); }

  onSelectReparto(reparto) {
    this.navCtrl.push(RepartoAmPage, {Reparto: reparto});
  }

  ngOnInit() { this.getUser(); }

  private async getUser() {
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }
}
