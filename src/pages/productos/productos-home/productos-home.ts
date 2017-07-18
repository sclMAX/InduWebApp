import {ProductosProvider} from './../../../providers/productos/productos';
import {Perfil, Linea} from './../../../models/productos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-productos-home',
  templateUrl: 'productos-home.html',
})
export class ProductosHomePage {
  perfiles: Perfil[];
  linea: Linea = new Linea();
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private productosP: ProductosProvider) {}

  ionViewDidLoad() {}

  onFilter(ev) { this.perfiles = ev; }
}
