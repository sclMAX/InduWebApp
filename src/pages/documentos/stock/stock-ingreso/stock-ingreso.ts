import {
  ContadoresProvider
} from './../../../../providers/contadores/contadores';
import {StockProvider} from './../../../../providers/stock/stock';
import {
  DocStockIngreso,
  DocStockItem
} from './../../../../models/documentos.class';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from 'ionic-angular';

@Component({
  selector: 'page-stock-ingreso',
  templateUrl: 'stock-ingreso.html',
})
export class StockIngresoPage {
  isShowAddItem: boolean = true;
  isShowDatos: boolean = true;
  docIngreso: DocStockIngreso = new DocStockIngreso();
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private stokP: StockProvider,
              private contadoresP: ContadoresProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {}

  ionViewDidLoad() {}

  ngOnInit() { this.getNro(); }

  private async getNro() {
    this.contadoresP.getStockIngresoCurrentNro().subscribe((nro) => {
      this.docIngreso.Numero = nro;
    }, (error) => { console.log(error); });
  }

  addItem(item: DocStockItem) {
    if (item && item.Cantidad && item.Color && item.Perfil) {
      if (this.docIngreso) {
        if (!this.docIngreso.Items) {
          this.docIngreso.Items = [];
        }
        this.docIngreso.Items.push(item);
      }
    }
  }

  removeItem(idx: number) {
    if (this.docIngreso && this.docIngreso.Items) {
      this.docIngreso.Items.splice(idx, 1);
    }
  }

  getTotalBarras(): number {
    let tB: number = 0;
    if (this.docIngreso && this.docIngreso.Items) {
      this.docIngreso.Items.forEach((item) => {
        if (item && item.Cantidad) {
          tB += item.Cantidad * 1;
        }
      });
    }
    return tB;
  }

  goBack() { this.navCtrl.pop(); }

  guardar() {
    if (this.docIngreso) {
      let load = this.loadCtrl.create({content: 'Actualizando Stock...'});
      let toast = this.toastCtrl.create({position: 'middle'});
      load.present().then(() => {
        this.stokP.setIngreso(this.docIngreso)
            .subscribe(
                (ok) => {
                  this.navCtrl.pop();
                  load.dismiss();
                  toast.setMessage(ok);
                  toast.setDuration(1000);
                  toast.present();
                },
                (error) => {
                  load.dismiss();
                  toast.setMessage(error);
                  toast.setShowCloseButton(true);
                  toast.present();
                });
      });
    }
  }
}
