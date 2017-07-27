import { StockIngresoPage } from './../../documentos/stock/stock-ingreso/stock-ingreso';
import { ProductosPerfilesListPage } from './../../productos/productos-perfiles-list/productos-perfiles-list';
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  selector: 'page-productos-home',
  templateUrl: 'productos-home.html',
})
export class ProductosHomePage {
  constructor(public navCtrl: NavController) {}
  goPerfiles(){
    this.navCtrl.push(ProductosPerfilesListPage);
  }

  goIngreso(){
    this.navCtrl.push(StockIngresoPage);
  }
}
