import {Observable} from 'rxjs/Observable';
import {
  ProductosPerfilesMppPage
} from './../../../pages/productos/productos-perfiles-mpp/productos-perfiles-mpp';
import {ModalController} from 'ionic-angular';
import {StockItem} from './../../../models/stock.clases';
import {StockProvider} from './../../../providers/stock/stock';
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Perfil} from '../../../models/productos.clases';
import { printStock } from "../../../print/print-stock";

@Component({selector: 'perfiles-list', templateUrl: 'perfiles-list.html'})
export class PerfilesListComponent {
  @Input('perfiles') perfiles: Perfil[];
  @Input('color') color: string;
  @Input('colorPar') colorPar: string;
  @Input('showImg') showImg: boolean = true;
  @Input() showToolBar: boolean = true;
  @Output() onSelectItem: EventEmitter<Perfil> = new EventEmitter<Perfil>();
  stocks: Array<
      {id: string, totalBarras: number, stocks: Observable<StockItem[]>}> = [];
  @Output() onCalcTotalKilos: EventEmitter<number> = new EventEmitter<number>();
  constructor(private stockP: StockProvider, private modalCtrl: ModalController) {}

  onClickItem(perfil) { this.onSelectItem.emit(perfil); }

  getStockTotalPerfil(idPerfil: string, items: StockItem[]): number {
    let stockTotal: number = 0;
    if (items) {
      items.forEach((i) => { stockTotal += Number(i.stock); });
    }
    let itemIdx = this.stocks.findIndex(i => i.id == idPerfil);
    if (itemIdx > -1) {
      this.stocks[itemIdx].totalBarras = stockTotal;
    }
    return stockTotal;
  }

  getStockPerfil(perfil: Perfil): Observable<StockItem[]> {
    let stk = this.stocks.find(i => i.id == perfil.id);
    if (stk) {
      return stk.stocks;
    } else {
      this.stocks.push({
        id: perfil.id,
        totalBarras: 0,
        stocks: this.stockP.getOneStokcs(perfil.id)
      });
    }
  }

  getTotalKilos(): number {
    let t: number = 0.00;
    if (this.perfiles) {
      for (let p of this.perfiles) {
        let stk = this.stocks.find(i => i.id == p.id);
        if (stk) {
          let barras: number = stk.totalBarras;
          t += Number(barras * ((p.largo / 1000) * p.pesoPintado));
        }
      };
    }
    this.onCalcTotalKilos.emit(t);
    return t;
  }

  edit(item: Perfil) {
    let modal = this.modalCtrl.create(ProductosPerfilesMppPage, {Perfil: item});
    modal.present();
  }

  printLista(){
    printStock(this.perfiles, this.stockP);
  }
}
