import {Component, EventEmitter, Output} from '@angular/core';
import {AlertController, LoadingController, ModalController, ToastController} from 'ionic-angular';

import {PedidoItem} from './../../../models/pedidos.clases';
import {Color, Perfil} from './../../../models/productos.clases';
import {StockEstado} from './../../../models/stock.clases';
import {StockProvider} from './../../../providers/stock/stock';
import {ColoresFindAndSelectComponent} from './../../colores-find-and-select/colores-find-and-select';
import {PerfilesFindAndSelectComponent} from './../../perfiles/perfiles-find-and-select/perfiles-find-and-select';

@Component({
  selector: 'pedido-header-add-item',
  templateUrl: 'pedido-header-add-item.html'
})
export class PedidoHeaderAddItemComponent {
  @Output()
  onNewItem: EventEmitter<PedidoItem> = new EventEmitter<PedidoItem>();
  newItem: PedidoItem = new PedidoItem();
  currentColor: Color;

  constructor(
      private modalCtrl: ModalController, private alertCtrl: AlertController,
      private loadCtrl: LoadingController, private stockP: StockProvider,
      private toastCtrl: ToastController) {
    // nada
  }

  goSelectCantidad() {
    let alert = this.alertCtrl.create({
      title: 'Cantidad',
      inputs: [{
        name: 'Cantidad',
        placeholder: 'Ingrese la cantida',
        type: 'number',
        value: `${this.newItem.Cantidad}`
      }],
      buttons: [{
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
      }]
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
    let load = this.loadCtrl.create({content: 'Consultando Stock...'});
    let toast = this.toastCtrl.create({
      message: 'Error de conexion!...Intente nuevamente.',
      position: 'middle',
      showCloseButton: true
    });
    load.present().then(() => {
      this.stockP.getEstado(this.newItem.Perfil.id, this.newItem.Color.id)
          .subscribe(
              (stkEst: StockEstado) => {
                let disponible = stkEst.disponible;
                if (this.newItem.Cantidad > disponible) {
                  load.dismiss();
                  let alert = this.alertCtrl.create({
                    title: 'Stock No Disponible!',
                    subTitle: 'No hay suficiente stock en el color solicitado.',
                    buttons: [
                      {text: 'Cancelar', role: 'cancel'}, {
                        text: 'Aceptar',
                        role: 'ok',
                        handler: () => {
                          this.emitItem();
                        }
                      }

                    ]
                  });
                  alert.setMessage(
                      `Cantidad Pedida: ${this.newItem.Cantidad}<br>
                                Stock Disponible: ${disponible} (${disponible -
                      this.newItem
                          .Cantidad})<br>
                                Stock Total: ${stkEst.stock} (${stkEst.stock -
                      this.newItem.Cantidad})<br>`);
                  alert.present();
                } else {
                  load.dismiss();
                  this.emitItem();
                }
              },
              (error) => {
                load.dismiss();
                toast.present();
              });
    });
  }

  private emitItem() {
    this.currentColor = this.newItem.Color;
    this.onNewItem.emit(this.newItem);
    this.newItem = new PedidoItem();
    this.newItem.Color = this.currentColor;
  }

  ngOnInit() {}
}
