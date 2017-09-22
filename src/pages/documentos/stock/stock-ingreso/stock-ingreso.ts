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
  isEdit: boolean = false;
  docIngreso: DocStockIngreso;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private stokP: StockProvider,
              private contadoresP: ContadoresProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {
    this.docIngreso = this.navParams.get('Ingreso');
    if (this.docIngreso) {
      this.isEdit = true;
    } else {
      this.docIngreso = new DocStockIngreso();
      this.getNro();
    }
  }

  ionViewDidLoad() {}

  ngOnInit() {}

  private async getNro() {
    this.contadoresP.getStockIngresoCurrentNro().subscribe((nro) => {
      if (!this.isEdit) {
        this.docIngreso.numero = nro;
      }
    }, (error) => { console.log(error); });
  }

  addItem(item: DocStockItem) {
    if (item && item.cantidad && item.Color && item.Perfil) {
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
        if (item && item.cantidad) {
          tB += item.cantidad * 1;
        }
      });
    }
    return tB;
  }

  getTotalKilos(): number {
    let t: number = 0.00;
    if (this.docIngreso ) {
      for (let item of this.docIngreso.Items) {
        let kb: number = 0;
        if (item.Color.isPintura) {
          kb = (item.Perfil.pesoPintado * (item.Perfil.largo / 1000));
        } else {
          kb = (item.Perfil.pesoNatural * (item.Perfil.largo / 1000));
        }
        t += Number(item.cantidad * kb);
      }
    }
    return t;
  }

  goBack() { this.navCtrl.pop(); }

  guardar() {
    if (this.docIngreso) {
      let load = this.loadCtrl.create({content: 'Actualizando Stock...'});
      let toast = this.toastCtrl.create({position: 'middle'});
      load.present().then(() => {
        this.isEdit = true;
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
                  this.isEdit = false;
                  load.dismiss();
                  toast.setMessage(error);
                  toast.setShowCloseButton(true);
                  toast.present();
                });
      });
    }
  }
}
