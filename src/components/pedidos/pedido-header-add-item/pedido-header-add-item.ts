import {Component, EventEmitter, Output} from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController
} from 'ionic-angular';

import {PedidoItem} from './../../../models/pedidos.clases';
import {Color, Perfil} from './../../../models/productos.clases';
import {StockEstado} from './../../../models/stock.clases';
import {StockProvider} from './../../../providers/stock/stock';
import {
  ColoresFindAndSelectComponent
} from './../../comunes/colores-find-and-select/colores-find-and-select';
import {
  PerfilesFindAndSelectComponent
} from './../../perfiles/perfiles-find-and-select/perfiles-find-and-select';

@Component({
  selector: 'pedido-header-add-item',
  templateUrl: 'pedido-header-add-item.html'
})
export class PedidoHeaderAddItemComponent {
  @Output()
  onNewItem: EventEmitter<PedidoItem> = new EventEmitter<PedidoItem>();
  newItem: PedidoItem = new PedidoItem();
  currentColor: Color;

  constructor(private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private loadCtrl: LoadingController,
              private stockP: StockProvider,
              private toastCtrl: ToastController) {
    // nada
  }

  goSelectCantidad() {
    let alert = this.alertCtrl.create({
      title: 'Cantidad',
      inputs: [
        {
          name: 'cantidad',
          placeholder: 'Ingrese la cantida',
          type: 'number',
          value: `${this.newItem.cantidad || 1}`
        }
      ],
      buttons: [
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data.cantidad > 0) {
              this.newItem.cantidad = data.cantidad * 1;
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
    if ((this.newItem.Perfil.pesoBase > 0) &&
        !(this.newItem.Perfil.notInStock)) {
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
                  if (this.newItem.cantidad > disponible) {
                    load.dismiss();
                    let alert = this.alertCtrl.create({
                      title: 'Stock No Disponible!',
                      subTitle:
                          'No hay suficiente stock en el color solicitado.',
                      buttons: [
                        {
                          text: 'Aceptar',
                          role: 'ok',
                          handler: () => { this.emitItem(); }
                        }

                      ]
                    });
                    alert.setMessage(
                        `<strong>Cantidad Pedida:</strong> ${this.newItem.cantidad
                      }<br>
                               <strong>Stock Disponible:</strong> ${disponible
                      } (${disponible -
                      this.newItem
                          .cantidad})<br>
                                <strong>Stock Total:</strong> ${stkEst
                          .stock} (${stkEst.stock -
                      this.newItem.cantidad})<br>`);
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
    } else {
      let alert = this.alertCtrl.create({
        title: 'Ingrese los Kilos y el Precio U$.',
        inputs: [
          {
            id: 'cu',
            name: 'cu',
            placeholder: 'kilos...',
            value: `${this.newItem.unidades}`,
            type: 'number'
          },
          {
            id: 'pu',
            name: 'pu',
            placeholder: 'Precio en U$',
            value: `${this.newItem.Color.precioUs}`,
            type: 'number'
          }
        ],
        buttons: [
          {
            text: 'Aceptar',
            role: 'ok',
            handler: (data) => {
              if (data.cu && data.pu) {
                this.newItem.unidades = Number(data.cu);
                this.newItem.precioUs = Number(data.pu);
                this.emitItem();
              }
            }
          }
        ]
      });
      alert.present();
    }
  }

  private emitItem() {
    this.currentColor = this.newItem.Color;
    this.onNewItem.emit(this.newItem);
    this.newItem = new PedidoItem();
    this.newItem.Color = this.currentColor;
  }

  ngOnInit() {}
}
