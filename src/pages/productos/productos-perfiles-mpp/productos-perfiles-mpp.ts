import { Stock } from './../../../models/stock.clases';
import { StockProvider } from './../../../providers/stock/stock';
import { Perfil } from './../../../models/productos.clases';
import { NavParams, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'page-productos-perfiles-mpp',
  templateUrl: 'productos-perfiles-mpp.html',
})
export class ProductosPerfilesMppPage {
  perfil: Perfil;
  stock: Stock;
  isChange: boolean = false;
  constructor(public viewCtrl: ViewController, public navParams: NavParams, private loadCtrl: LoadingController, private toastCtrl: ToastController, private stockP: StockProvider) {
    this.perfil = this.navParams.get('Perfil');
    if (this.perfil) {
      this.getData();
    } else {
      this.goBack();
    }

  }

  goBack() { this.viewCtrl.dismiss(); }

  aceptar() {
    let load = this.loadCtrl.create({ content: 'Actualizando Minimo Punto Pedido...' });
    let toast = this.toastCtrl.create({ position: 'middle' });
    load.present().then(() => {
        this.stockP.setMpp(this.stock).subscribe((ok) => {
          load.dismiss();
          this.viewCtrl.dismiss();
          toast.setMessage(ok);
          toast.setDuration(1000);
          toast.present();
        }, (error) => {
          load.dismiss();
          toast.setMessage(error);
          toast.setShowCloseButton(true);
          toast.setBackButtonText('OK');
          toast.present();
        });
    });
  }

  getTotal(stock: Stock): number {
    let t: number = 0;
    if (stock) {
      stock.Stocks.forEach((s) => {
        t += Number(s.stock);
      });
    }
    return t;
  }

  ionViewDidLoad() { }
  private async getData() {
   this.stockP.getOne(this.perfil.id).subscribe((stk)=>{
     this.stock = stk;
   })
  }
}
