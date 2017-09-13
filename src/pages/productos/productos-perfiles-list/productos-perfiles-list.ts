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
            if (stk && stk.Stocks && stk.Stocks.length > 0) {  // Si Existe
              let msg: string = '';
              let st: number = 0;   // Stock Total
              let std: number = 0;  // Stock Disponible
              //Funcion para recorrer array
              let loop = (idx) => {
                let i = stk.Stocks[idx];
                //Buscar esatado actual
                this.stockP.getEstado(perfil.id, i.id)
                    .subscribe((est) => {
                      msg +=`<strong>${i.id}</strong>`;
                      msg +=`<ul> <li>Disponible: <strong>${est.disponible}</strong></li>`;
                      msg +=`<li>Stock:      ${i.stock}</li>`;
                      msg +=`<li>  Min.Pedido: ${i.mpp}</li></ul>`;
                      std += Number(est.disponible);
                      st += Number(i.stock);
                      idx++;
                      if (idx < stk.Stocks.length) {
                        loop(idx);
                      } else {
                        load.dismiss();
                        msg +=
                            `<strong>Total: \t\t</strong><strong>dis. ${std} de ${st}</strong><br>`;
                        let showStock = this.alertCtrl.create({
                          title: `Stock ${perfil.codigo}`,
                          message: msg,
                          buttons: [{text: 'Aceptar', role: 'ok'}]
                        });
                        showStock.present();
                      }
                    });
              };
              //Recorrer Array
              loop(0);
            } else {  // Si no, No hay stock
              load.dismiss();
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
