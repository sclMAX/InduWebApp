import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {SUC_STOCK_ROOT} from './../../../../providers/sucursal/sucursal';
import {Stock} from './../../../../models/productos.clases';
import {StockProvider} from './../../../../providers/stock/stock';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';
import {Cliente} from './../../../../models/clientes.clases';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {Pedido, PedidoItem} from './../../../../models/pedidos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  AlertController,
  LoadingController,
  ToastController
} from 'ionic-angular';

@Component({
  selector: 'page-pedidos-embalar',
  templateUrl: 'pedidos-embalar.html',
})
export class PedidosEmbalarPage {
  pedido: Pedido;
  oldPedido: Pedido;
  cliente: Cliente;
  isModificado: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private pedidosP: PedidosProvider, private stockP: StockProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private db: AngularFireDatabase) {
    this.oldPedido = this.navParams.get('Pedido');
    this.cliente = this.navParams.get('Cliente');
    if (!this.oldPedido) {
      this.navCtrl.pop();
    } else {
      this.pedido = JSON.parse(JSON.stringify(this.oldPedido));
      if (!this.cliente) {
        this.clientesP.getOne(this.pedido.idCliente)
            .subscribe((cliente) => { this.cliente = cliente; });
      }
    }
  }

  getItemsPendientes(): PedidoItem[] {
    return this.pedido.Items.filter((item) => { return !item.isEmbalado; });
  }

  getItemsEmbalados(): PedidoItem[] {
    return this.pedido.Items.filter((item) => { return item.isEmbalado; });
  }

  goBack() { this.navCtrl.pop(); }

  guardar() {
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast =
        this.toastCtrl.create({position: 'middle', closeButtonText: 'OK'});
    load.present().then(() => {
      this.pedidosP.update(this.pedido)
          .subscribe(
              (ok) => {
                this.navCtrl.pop();
                load.dismiss();
                toast.setMessage(ok);
                toast.setDuration(1000);
                toast.present();
              },
              (error) => {
                load.dismiss();
                toast.setMessage(error);
                toast.setShowCloseButton(true);
                toast.present();
              });
    });
  }

  cerrarPedido() {
    let alert = this.alertCtrl.create({
      title: 'Cantidad de Paquetes?',
      subTitle: 'Ingrese la cantidad de paquetes armados para el pedido.',
      inputs: [
        {
          name: 'cp',
          type: 'number',
          min: '1',
          placeholder: 'Cantidad de paquetes...'
        }
      ],
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data) {
              let cp: number = data.cp * 1;
              if (cp > 0) {
                this.updateStock(cp);
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  setEmbalado(item: PedidoItem, isEmbalado: boolean) {
    let alert = this.alertCtrl.create({
      title: `${(isEmbalado)?'Cantidad Embalada?':'Cantidad Desembalada?'}`,
      inputs: [
        {
          type: 'number',
          value: `${item.Cantidad}`,
          max: `${item.Cantidad}`,
          min: '1',
          name: 'newCantidad'
        }
      ],
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data) {
              let nc: number = data.newCantidad * 1;
              if ((nc > 0) && (nc <= (item.Cantidad * 1))) {
                if (nc < item.Cantidad * 1) {
                  let newItem: PedidoItem = new PedidoItem();
                  newItem = JSON.parse(JSON.stringify(item));
                  newItem.Cantidad = item.Cantidad - nc;
                  newItem.isEmbalado = !isEmbalado;
                  item.Cantidad = nc;
                  item.isEmbalado = isEmbalado;
                  this.pedido.Items.push(newItem);
                } else {
                  item.isEmbalado = isEmbalado;
                }
                this.unificar();
                this.isModificado = true;
              }
            }
          }
        }
      ]

    });

    alert.present();
  }

  unificar() {
    let items: PedidoItem[] = this.pedido.Items;
    for (let i = 0; i < items.length; i++) {
      for (let x = 0; x < items.length; x++) {
        if ((i != x)) {
          if ((items[i].isEmbalado == items[x].isEmbalado) &&
              (items[i].isStockActualizado == items[x].isStockActualizado) &&
              (items[i].Perfil.id == items[x].Perfil.id) &&
              (items[i].Color.id == items[x].Color.id)) {
            items[i].Cantidad =
                (items[i].Cantidad * 1) + (items[x].Cantidad * 1);
            items.splice(x, 1);
          }
        }
      }
    }
  }

  private updateStock(paquetes: number) {
    let load = this.loadCtrl.create({content: 'Actualizando Stock...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.stockP.updateStockItems(this.pedido.Items)
          .subscribe(
              (ok) => {
                load.dismiss();
                this.pedido.CantidadPaquetes = paquetes;
                this.pedido.isPreparado = true;
                this.pedido.Items.forEach(
                    (item) => { item.isStockActualizado = true; });
                this.guardar();
              },
              (error) => {
                load.dismiss();
                toast.setMessage(error);
                toast.setShowCloseButton(true);
                toast.present();
              });
    });
  }
}
