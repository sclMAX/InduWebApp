import { Observable } from 'rxjs/Observable';
import { ProductosPerfilesMppPage } from './../../../pages/productos/productos-perfiles-mpp/productos-perfiles-mpp';
import { ModalController } from 'ionic-angular';
import { Stock, StockItem } from './../../../models/stock.clases';
import { StockProvider } from './../../../providers/stock/stock';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Perfil } from '../../../models/productos.clases';

@Component({ selector: 'perfiles-list', templateUrl: 'perfiles-list.html' })
export class PerfilesListComponent {
  @Input('perfiles') perfiles: Perfil[];
  @Input('color') color: string;
  @Input('colorPar') colorPar: string;
  @Input('showImg') showImg: boolean = true;
  @Input() showToolBar: boolean = true;
  @Output() onSelectItem: EventEmitter<Perfil> = new EventEmitter<Perfil>();
  stock: Stock[] = [];
  stocks: Array<{ id: string,totalBarras:number, stocks: Observable<StockItem[]> }> = [];
  @Output() onCalcTotalKilos: EventEmitter<number> = new EventEmitter<number>();
  constructor(private stockP: StockProvider, private modalCtrl: ModalController) { }

  onClickItem(perfil) { this.onSelectItem.emit(perfil); }

  getStockTotalPerfil(idPerfil:string, items: StockItem[]): number {
    let stockTotal: number = 0;
    if (items) {
      items.forEach((i) => { stockTotal += Number(i.stock); });
    }
    let itemIdx = this.stocks.findIndex(i=>i.id == idPerfil);
    if(itemIdx >-1){
      this.stocks[itemIdx].totalBarras = stockTotal;
    }
    return stockTotal;
  }

  getStocksPerfil(perfil: Perfil): StockItem[] {
    let st = this.stock.find((s) => { return s.id == perfil.id; });
    if (st && st.Stocks) {
      return st.Stocks.sort((a, b) => {
        if (a.id > b.id) return 1;
        if (a.id < b.id) return -1;
        return 0;
      });
    }
    return [];
  }

  getStockPerfil(perfil: Perfil): Observable<StockItem[]> {
    let stk = this.stocks.find(i => i.id == perfil.id);
    if (stk) {
      return stk.stocks;
    } else {
      this.stocks.push({
        id: perfil.id,
        totalBarras:0,
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

  private async getItems(stk):Promise<StockItem[]>{
    return new Promise<StockItem[]>((res,rej)=>{
      stk.stocks.subscribe(s=>res(s),e=>rej(e));
    });
  }

  edit(item: Perfil) {
    let modal = this.modalCtrl.create(ProductosPerfilesMppPage, { Perfil: item });
    modal.present();
  }

  ngOnInit() { this.getStock(); }
  ionViewWillEnter() { this.getStock(); }

  private async getStock() {
    this.stockP.getAll().subscribe((data) => { this.stock = data; })
  }
}
