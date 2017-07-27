import {
  ColoresFindAndSelectComponent
} from './../../colores-find-and-select/colores-find-and-select';
import {
  PerfilesFindAndSelectComponent
} from './../../perfiles-find-and-select/perfiles-find-and-select';
import {Color, Perfil} from './../../../models/productos.clases';
import {ModalController, AlertController} from 'ionic-angular';
import {ProductosProvider} from './../../../providers/productos/productos';
import {DocStockItem} from './../../../models/documentos.class';
import {Component, EventEmitter, Output} from '@angular/core';
@Component({
  selector: 'stock-ingreso-add-item',
  templateUrl: 'stock-ingreso-add-item.html'
})
export class StockIngresoAddItemComponent {
  @Output()
  onNewItem: EventEmitter<DocStockItem> = new EventEmitter<DocStockItem>();
  newItem: DocStockItem = new DocStockItem();
  currentColor: Color;

  constructor(private productosP: ProductosProvider,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController) {}

  goSelectCantidad() {
    let alert = this.alertCtrl.create({
      title: 'Cantidad',
      inputs: [
        {
          name: 'Cantidad',
          placeholder: 'Ingrese la cantida',
          type: 'number',
          value: `${this.newItem.Cantidad || 1}`
        }
      ],
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data.Cantidad > 0) {
              this.newItem.Cantidad = data.Cantidad;
              if (!this.newItem.Perfil) {
                this.goSelectPerfil();
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  goSelectPerfil() {
    let findPerfi = this.modalCtrl.create(PerfilesFindAndSelectComponent, {});
    findPerfi.onDidDismiss((data: Perfil) => {
      if (data) {
        this.newItem.Perfil = data;
        if (!this.newItem.Color) {
          this.goSelectColor();
        }
      }
    });
    findPerfi.present();
  }

  goSelectColor() {
    let findColor = this.modalCtrl.create(ColoresFindAndSelectComponent, {});
    findColor.onDidDismiss((data) => {
      if (data) {
        this.newItem.Color = data;
        this.currentColor = data;
      }
    });
    findColor.present();
  }

  addItem() {
    this.currentColor = this.newItem.Color;
    this.onNewItem.emit(this.newItem);
    this.newItem = new DocStockItem();
    this.newItem.Color = this.currentColor;
  }
}
