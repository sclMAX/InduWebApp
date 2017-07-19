import {Perfil, Linea} from './../../../models/productos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-productos-perfiles-list',
  templateUrl: 'productos-perfiles-list.html',
})
export class ProductosPerfilesListPage {
  perfiles: Perfil[];
  linea: Linea = new Linea();
  showImagenes: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {}

  onFilter(ev) { this.perfiles = ev; }
}
