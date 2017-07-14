import { AngularFireAuth } from 'angularfire2/auth';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { ClientesPage } from './../clientes/clientes';
import {Cliente} from './../../models/cliente.class';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {currentSucursal} from './../../providers/sucursal/sucursal';
import {LoginPage} from './../login/login';

@Component({selector: 'page-home', templateUrl: 'home.html'})

export class HomePage {
  title: string = currentSucursal;
  clientes: Cliente[];

  constructor(public navCtrl: NavController, private auth: AngularFireAuth,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {}

  logOut() {
    this.auth.auth.signOut();
    this.navCtrl.setRoot(LoginPage);
  }

  goClientes(){
    this.navCtrl.push(ClientesPage);
  }

  pruebaCliente() {
    let load = this.loadCtrl.create({content: 'Buscando Clientes...'});
    load.present().then(() => {
      this.clientesP.Clientes.subscribe(
          clientes => {
            this.clientes = clientes;
            load.dismiss();
          },
          error => {
            load.dismiss();
            let toast = this.toastCtrl.create(
                {duration: 1000, message: `Error: ${error}`});
            toast.present();

          },
          () => {
            load.dismiss();
          });
    });
  }
 // ionViewDidEnter() { this.title = currentSucursal; }
}
