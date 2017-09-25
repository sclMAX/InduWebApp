import { SUCURSAL } from './../../../providers/sucursal/sucursal';
import { StockIngresoPage } from './../../documentos/stock/stock-ingreso/stock-ingreso';
import { ProductosPerfilesListPage } from './../../productos/productos-perfiles-list/productos-perfiles-list';
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  selector: 'page-productos-home',
  templateUrl: 'productos-home.html',
})
export class ProductosHomePage {
  title:string;
  constructor(public navCtrl: NavController) {
    this.title = `Suc. ${SUCURSAL} - Productos`;
  }
  goPerfiles(){
    this.navCtrl.push(ProductosPerfilesListPage);
  }

  goIngreso(){
    this.navCtrl.push(StockIngresoPage);
  }
}
