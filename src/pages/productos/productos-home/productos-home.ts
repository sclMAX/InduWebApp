import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

import {Linea, Perfil} from './../../../models/productos.clases';
import {ProductosProvider} from './../../../providers/productos/productos';

@Component({
  selector: 'page-productos-home',
  templateUrl: 'productos-home.html',
})
export class ProductosHomePage {
  perfiles: Perfil[];
  linea: Linea = new Linea();
  showImagenes: boolean = false;
  constructor(
      public navCtrl: NavController, public navParams: NavParams,
      private productosP: ProductosProvider) {}

  ionViewDidLoad() {}

  onFilter(ev) {
    this.perfiles = ev;
  }
}
