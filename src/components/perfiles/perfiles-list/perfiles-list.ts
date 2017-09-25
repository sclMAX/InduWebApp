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
  @Input() showToolBar:boolean = true;
  @Output() onSelectItem: EventEmitter<Perfil> = new EventEmitter<Perfil>();
  stock: Stock[] = [];
  @Output() onCalcTotalKilos: EventEmitter<number> = new EventEmitter<number>();
  constructor(private stockP: StockProvider) { }

  onClickItem(perfil) { this.onSelectItem.emit(perfil); }

  getStockTotalPerfil(perfil: Perfil): number {
    let st = this.stock.find((s) => { return s.id == perfil.id; });
    if (st && st.Stocks) {
      let stockTotal: number = 0;
      st.Stocks.forEach((i) => { stockTotal += Number(i.stock); });
      return stockTotal;
    }
    return 0;
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

  getTotalKilos(): number {
    let t: number = 0.00;
    if(this.perfiles){
    this.perfiles.forEach((p) => {
      let barras: number = this.getStockTotalPerfil(p);
      t += Number(barras * ((p.largo / 1000) * p.pesoPintado));
    });}
    this.onCalcTotalKilos.emit(t);
    return t;
  }

  ngOnInit() { this.getStock(); }
  ionViewWillEnter() { this.getStock(); }

  private async getStock() {
    this.stockP.getAll().subscribe((data) => { this.stock = data;  })
  }
}
