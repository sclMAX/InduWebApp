import {
  LineasFindAndSelectComponent
} from './../../../components/lineas-find-and-select/lineas-find-and-select';
import {Perfil, Color, Linea} from './../../../models/productos.clases';
import {
  ColoresFindAndSelectComponent
} from './../../../components/colores-find-and-select/colores-find-and-select';
import {
  PerfilesFindAndSelectComponent
} from './../../../components/perfiles/perfiles-find-and-select/perfiles-find-and-select';
import {Descuento} from './../../../models/clientes.clases';
import {Component} from '@angular/core';
import {ModalController, ViewController} from 'ionic-angular';
@Component({
  selector: 'page-clientes-add-descuento',
  templateUrl: 'clientes-add-descuento.html',
})
export class ClientesAddDescuentoPage {
  descuento: Descuento = new Descuento;

  constructor(public viewCtrl: ViewController,
              private modalCtrl: ModalController) {}

  ionViewDidLoad() {}

  goSelectPerfil() {
    let findPerfi = this.modalCtrl.create(PerfilesFindAndSelectComponent, {});
    findPerfi.onDidDismiss((data: Perfil) => {
      if (data) {
        this.descuento.id = data.id;
      }
    });
    findPerfi.present();
  }

  goSelectColor() {
    let findColor = this.modalCtrl.create(ColoresFindAndSelectComponent, {});
    findColor.onDidDismiss((data: Color) => {
      if (data) {
        this.descuento.id = data.id;
      }
    });
    findColor.present();
  }
  goSelectLinea() {
    let findColor = this.modalCtrl.create(LineasFindAndSelectComponent, {});
    findColor.onDidDismiss((data: Linea) => {
      if (data) {
        this.descuento.id = data.id;
      }
    });
    findColor.present();
  }

  goBack() { this.viewCtrl.dismiss(); }

  aceptar() { this.viewCtrl.dismiss(this.descuento); }
}
