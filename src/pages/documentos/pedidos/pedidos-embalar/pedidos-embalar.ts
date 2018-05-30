import {Component} from '@angular/core';
import {
  AlertController,
  FabContainer,
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';

import {printEmbalar} from '../../../../print/print-pedidos';

import {Cliente} from './../../../../models/clientes.clases';
import {Pedido, PEDIDO, PedidoItem} from './../../../../models/pedidos.clases';
import {Usuario} from './../../../../models/user.class';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {PedidosProvider} from './../../../../providers/pedidos/pedidos';
import {UsuarioProvider} from './../../../../providers/usuario/usuario';
import {PedidosNewPage} from './../pedidos-new/pedidos-new';

@Component({
  selector: 'page-pedidos-embalar',
  templateUrl: 'pedidos-embalar.html',
})
export class PedidosEmbalarPage {
  pedido: Pedido;
  idPedido: number;
  cliente: Cliente;
  isModificado: boolean = false;
  usuario: Usuario;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private usuarioP: UsuarioProvider,
              private pedidosP: PedidosProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController) {
    this.idPedido = this.navParams.get('idPedido');
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
    if (!this.idPedido) {
      this.navCtrl.pop();
    } else {
      this.pedidosP.getOne(PEDIDO, this.idPedido)
          .subscribe((ok) => { this.pedido = ok; });
      this.clientesP.getOne(this.pedido.idCliente)
          .subscribe((cliente) => { this.cliente = cliente; });
    }
  }

  getItemsPendientes(): PedidoItem[] {
    if (this.pedido && this.pedido.Items) {
      return this.pedido.Items.filter((item) => { return !item.isEmbalado; });
    } else {
      return [];
    }
  }

  getItemsEmbalados(): PedidoItem[] {
    if (this.pedido && this.pedido.Items) {
      return this.pedido.Items.filter((item) => { return item.isEmbalado; });
    } else {
      return [];
    }
  }

  removeItem(item, fab: FabContainer) {
    fab.close();
    let alert = this.alertCtrl.create({
      title: 'Eliminar Item...',
      subTitle: 'Esta seguro que desea eliminar el item?',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            let i =
                this.pedido.Items.findIndex((it) => { return item === it; });
            if (i > -1) {
              this.pedido.Items.splice(i, 1);
              this.isModificado = true;
            }
          }
        }
      ]
    });
    alert.present();
  }

  modificarItem(item: PedidoItem, fab: FabContainer) {
    fab.close();
    let alert = this.alertCtrl.create({
      title: 'Cambiar Cantidad...',
      inputs: [
        {
          name: 'cantidad',
          type: 'number',
          min: '1',
          value: `${item.cantidad}`
        }
      ],
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: (data) => {
            if (data && data.cantidad > 0) {
              item.cantidad = data.cantidad;
              this.isModificado = true;
            }
          }
        }
      ]
    });
    alert.present();
  }

  goBack() { this.navCtrl.pop(); }

  goPrintEmbalar() {
    //  this.navCtrl.push(PrintPedidoParaEmbalarPage,{Pedido: this.pedido,
    //  Cliente: this.cliente});
    printEmbalar(this.cliente, this.pedido);
  }

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

  editar() {
    this.navCtrl.pop();
    this.navCtrl.push(PedidosNewPage, {Pedido: this.pedido});
  }

  borrarPedido() {
    let alert = this.alertCtrl.create({
      title: 'Eliminar Pedido...',
      subTitle:
          `Esta seguro que desea eliminar definitivamente el pedido Nro:${this
              .pedido.numero}?`,
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            let load = this.loadCtrl.create({content: 'Eliminando pedido...'});
            let toast = this.toastCtrl.create({position: 'middle'});
            load.present().then(() => {
              this.pedidosP.remove(this.pedido)
                  .subscribe(
                      (ok) => {
                        load.dismiss();
                        this.navCtrl.pop();
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
        }
      ]
    });
    alert.present();
  }

  prepararPedido() {
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
                this.pedidoToEmbalado(cp);
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  setEmbalado(item: PedidoItem, isEmbalado: boolean, fab: FabContainer) {
    fab.close();
    let alert = this.alertCtrl.create({
      title: `${(isEmbalado) ? 'Cantidad Embalada?' : 'Cantidad Desembalada?'
                                                      }`,
      inputs: [
        {
          type: 'number',
          value: `${item.cantidad}`,
          max: `${item.cantidad}`,
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
              if ((nc > 0) && (nc <= (item.cantidad * 1))) {
                if (nc < item.cantidad * 1) {
                  let newItem: PedidoItem = new PedidoItem();
                  newItem = JSON.parse(JSON.stringify(item));
                  newItem.cantidad = item.cantidad - nc;
                  newItem.isEmbalado = !isEmbalado;
                  item.cantidad = nc;
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
            items[i].cantidad =
                (items[i].cantidad * 1) + (items[x].cantidad * 1);
            items.splice(x, 1);
          }
        }
      }
    }
  }

  private pedidoToEmbalado(paquetes: number) {
    let load = this.loadCtrl.create({content: 'Actualizando Stock...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.pedido.cantidadPaquetes = paquetes;
      this.pedidosP.setEmbalado(this.pedido)
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

  pedidoToPresupuesto() {
    let load = this.loadCtrl.create({content: 'Moviendo Pedido...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.pedidosP.pedidoToPresupuesto(this.pedido)
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
}
