import {
  ColoresFindAndSelectComponent
} from './../colores-find-and-select/colores-find-and-select';
import {ColoresProvider} from './../../providers/colores/colores';
import {
  PerfilesFindAndSelectComponent
} from './../perfiles-find-and-select/perfiles-find-and-select';
import {ModalController, AlertController} from 'ionic-angular';
import {ProductosProvider} from './../../providers/productos/productos';
import {Perfil, Color} from './../../models/productos.clases';
import {PedidoItem} from './../../models/pedidos.clases';
import {Component, Output, EventEmitter} from '@angular/core';
@Component({
  selector: 'pedido-header-add-item',
  templateUrl: 'pedido-header-add-item.html'
})
export class PedidoHeaderAddItemComponent {
  @Output()
  onNewItem: EventEmitter<PedidoItem> = new EventEmitter<PedidoItem>();
  newItem: PedidoItem = new PedidoItem();
  perfiles: Perfil[];
  currentColor: Color;

  constructor(private productosP: ProductosProvider,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController) {}
  goSelectCantidad() {
    let alert = this.alertCtrl.create({
      title: 'Cantidad',
      inputs: [
        {
          name: 'Cantidad',
          placeholder: 'Ingrese la cantida',
          type: 'number',
          value: `${this.newItem.Cantidad}`
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
    this.newItem = new PedidoItem();
    this.newItem.Color = this.currentColor;
  }

  ngOnInit() {
    this.productosP.getPerfiles().subscribe(
        (data) => { this.perfiles = data; });
  }
}
