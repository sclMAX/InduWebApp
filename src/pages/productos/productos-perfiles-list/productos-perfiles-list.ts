import {StockProvider} from './../../../providers/stock/stock';
import {Perfil, Linea} from './../../../models/productos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  LoadingController,
  ToastController
} from 'ionic-angular';

@Component({
  selector: 'page-productos-perfiles-list',
  templateUrl: 'productos-perfiles-list.html',
})
export class ProductosPerfilesListPage {
  perfiles: Perfil[];
  linea: Linea = new Linea();
  showImagenes: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private alertCtrl: AlertController, private stockP: StockProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {}

  ionViewDidLoad() {}

  onFilter(ev) { this.perfiles = ev; }

  onSelectItem(perfil: Perfil) {
    let load = this.loadCtrl.create({content: 'Consultando Stock...'});
    let toast = this.toastCtrl.create({
      message: `Perfil: ${perfil.codigo} Sin Stock!`,
      position: 'middle',
      showCloseButton: true
    });
    load.present().then(() => {
      this.stockP.getOne(perfil.id).subscribe(
          (stk) => {
            load.dismiss();
            if (stk && stk.Stocks && stk.Stocks.length > 0) {  // Si Existe
              let msg: string = '';
              let st: number = 0;
              stk.Stocks.forEach((i) => {
                msg += `<strong>${i.id} :</strong><span> ${i.stock}</span><br>`;
                st += Number(i.stock);
              });
              msg += `<strong>Total: </strong><strong> ${st}</strong><br>`;
              let showStock = this.alertCtrl.create({
                title: `Stock ${perfil.codigo}`,
                message: msg,
                buttons: [{text: 'Aceptar', role: 'ok'}]
              });
              showStock.present();
            } else {  // Si no, No hay stock
              toast.present();
            }
          },
          (error) => {
            load.dismiss();
            toast.present();
            console.error(error);
          });
    });
  }
}
