import {
  StockIngresoPage
} from './../../../pages/documentos/stock/stock-ingreso/stock-ingreso';
import {NavController} from 'ionic-angular';
import {StockProvider} from './../../../providers/stock/stock';
import {Observable} from 'rxjs/Observable';
import {
  DocStockIngreso,
  DocStockItem
} from './../../../models/documentos.class';
import {Component} from '@angular/core';
@Component(
    {selector: 'stock-ingresos-card', templateUrl: 'stock-ingresos-card.html'})

export class StockIngresosCardComponent {
  showList: boolean = false;
  ingresos: Observable<DocStockIngreso[]>;
  constructor(public navCtrl: NavController, private stockP: StockProvider) {}

  getItemKilos(items: DocStockItem[]): number {
    let tk: number = 0.00;
    for (let i of items) {
      if (i.Color.isPintura) {
        tk += Number(i.cantidad) *
              (i.Perfil.pesoPintado * (i.Perfil.largo / 1000));
      } else {
        tk += Number(i.cantidad) *
              (i.Perfil.pesoNatural * (i.Perfil.largo / 1000));
      }
    }
    return tk;
  }

  getTotalKilos(docs: DocStockIngreso[]): number {
    let tk: number = 0.00;
    if (docs) {
      for (let doc of docs) {
        tk += this.getItemKilos(doc.Items);
      }
    }
    return tk;
  }

  goIngreso(item) { this.navCtrl.push(StockIngresoPage, {Ingreso: item}); }

  ngOnInit() { this.getData(); }

  private async getData() { this.ingresos = this.stockP.getIngresos(); }
}
