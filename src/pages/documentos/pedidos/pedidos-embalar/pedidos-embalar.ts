import {UsuarioProvider} from './../../../../providers/usuario/usuario';
import {Usuario} from './../../../../models/user.class';
import {
  PrintPedidoParaEmbalarPage
} from './../../../documentos/print/print-pedido-para-embalar/print-pedido-para-embalar';
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
  ToastController,
  FabContainer
} from 'ionic-angular';

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
      this.pedidosP.getOne(this.idPedido)
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

  goBack() { this.navCtrl.pop(); }

  goPrintEmbalar() {
    this.navCtrl.push(PrintPedidoParaEmbalarPage, {Pedido: this.pedido});
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

  borrarPedido() {
    let alert = this.alertCtrl.create({
      title: 'Eliminar Pedido...',
      subTitle:
          `Esta seguro que desea eliminar definitivamente el pedido Nro:${this.pedido.Numero}?`,
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
                this.setPreparado(cp);
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

  private setPreparado(paquetes: number) {
    let load = this.loadCtrl.create({content: 'Actualizando Stock...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.pedido.CantidadPaquetes = paquetes;
      this.pedidosP.prepararPedido(this.pedido)
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
