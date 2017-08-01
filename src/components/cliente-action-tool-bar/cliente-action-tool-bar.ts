import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AlertController, LoadingController, NavController, ToastController} from 'ionic-angular';

import {Cliente} from './../../models/clientes.clases';
import {ClientesAddPage} from './../../pages/clientes/clientes-add/clientes-add';
import {PedidosNewPage} from './../../pages/documentos/pedidos/pedidos-new/pedidos-new';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {PedidosProvider} from './../../providers/pedidos/pedidos';

@Component({
  selector: 'cliente-action-tool-bar',
  templateUrl: 'cliente-action-tool-bar.html'
})
export class ClienteActionToolBarComponent {
  @Input('cliente') cliente: Cliente;
  @Input('color') color: string;
  @Input() showDetalle: boolean = true;
  @Output() onVer: EventEmitter<Cliente> = new EventEmitter<Cliente>();
  showRemove: boolean = false;

  constructor(
      private alertCtrl: AlertController, private navCtrl: NavController,
      private loadCtrl: LoadingController, private toastCtrl: ToastController,
      private clientesP: ClientesProvider, private pedidosP: PedidosProvider) {}

  ngOnInit() {
    this.getShowRemove();
  }

  public showTelefonos(cliente: Cliente) {
    let alert =
        this.alertCtrl.create({title: 'TELEFONOS', buttons: ['Cerrar']});
    let msg: string = '';
    cliente.Telefonos.forEach((tel) => {
      msg += `<h5>${tel.Contacto}: ${tel.Numero}</h5>`;
    });
    alert.setMessage(msg);
    alert.present();
  }

  goCliente() {
    this.onVer.emit(this.cliente);
  }

  newPedido(cliente: Cliente) {
    this.navCtrl.push(PedidosNewPage, {Cliente: cliente});
  }

  goClienteUpdate(cliente: Cliente) {
    this.navCtrl.push(ClientesAddPage, {Cliente: cliente});
  }

  private getShowRemove() {
    this.pedidosP.getAllCliente(this.cliente.id).subscribe((data) => {
      if (data && data.length > 0) {
        this.showRemove = false;
      } else {
        this.showRemove = true;
      }
    });
  }

  removeCliente(cliente: Cliente) {
    let alert = this.alertCtrl.create({
      title: 'Eliminar?',
      subTitle:
          `Esta seguro que quiere ELIMINAR definitivamete el cliente: ${cliente
              .Nombre}?`,
      buttons: [
        {text: 'Cancelar', role: 'cancel'}, {
          text: 'Aceptar',
          role: 'ok',
          handler: () => {
            let load = this.loadCtrl.create({content: 'Eliminando Cliente...'});
            load.present().then(() => {
              let toast = this.toastCtrl.create({position: 'middle'});
              this.clientesP.remove(cliente).subscribe(
                  (ok) => {
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
      ]
    });
    alert.present();
  }
}
