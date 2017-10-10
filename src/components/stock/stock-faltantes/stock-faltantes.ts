import {ColoresProvider} from './../../../providers/colores/colores';
import {Color} from './../../../models/productos.clases';
import {StockFaltantes, StockProvider} from './../../../providers/stock/stock';
import {Observable} from 'rxjs/Observable';
import {Component} from '@angular/core';

@Component({selector: 'stock-faltantes', templateUrl: 'stock-faltantes.html'})
export class StockFaltantesComponent {
  showList: boolean = false;
  selColor: Color;
  colores: Observable<Color[]>;
  faltantes: Observable<StockFaltantes[]>;
  constructor(private stockP: StockProvider,
              private coloresP: ColoresProvider) {}

  ngOnInit() {
    this.faltantes = this.stockP.getFaltantes();
    this.colores = this.coloresP.getAll();
  }

  ngOnDestroy() { console.log('Destroy', this.faltantes); }

  filtrar() {
    this.faltantes = this.stockP.getFaltantes().map(data => {
      if (this.selColor) {
        return data.filter(i => i.idColor == this.selColor.id);
      } else {
        return data;
      }
    });
  }
}
