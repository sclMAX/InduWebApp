import {ChequesAmPage} from './../fondos/cheques/cheques-am/cheques-am';
import {PRESUPUESTO} from './../../models/pedidos.clases';
import {PedidosNewPage} from './../documentos/pedidos/pedidos-new/pedidos-new';
import {Usuario} from './../../models/user.class';
import {FondosHomePage} from './../fondos/fondos-home/fondos-home';
import {RepartosHomePage} from './../repartos/repartos-home/repartos-home';
import {ProductosHomePage} from './../productos/productos-home/productos-home';
import {Component} from '@angular/core';
import {NavController, ToastController, Toast} from 'ionic-angular';
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
  help: Toast;

  constructor(public navCtrl: NavController, private toatCtrl: ToastController,
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

  ngOnInit() { this.getUser(); }

  showHelp(txt: string) {
    this.help = this.toatCtrl.create({position:'bottom', message:txt});
    this.help.present();
  }

  downHelp(){this.help.dismiss();}

  private async getUser() {
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }
}
