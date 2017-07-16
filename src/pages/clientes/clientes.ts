import {Component} from '@angular/core';
import {AlertController, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';

import {Cliente} from './../../models/cliente.class';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {ClientesAddPage} from './../clientes-add/clientes-add';

@Component({
  selector: 'page-clientes',
  templateUrl: 'clientes.html',
})
export class ClientesPage {
  clientes: Cliente[];
  filterClientes: Cliente[];

  constructor(
      public navCtrl: NavController, public navParams: NavParams,
      private clientesP: ClientesProvider, private loadCtrl: LoadingController,
      private modalCtrl: ModalController, private alerCtrl: AlertController,
      private toastCtrl: ToastController) {}

  public goClienteAdd() {
    let clienteAddModal = this.modalCtrl.create(
        ClientesAddPage, {}, {enableBackdropDismiss: false});
    clienteAddModal.present();
  }

  public removeCliente(cliente: Cliente) {
    let alert = this.alerCtrl.create({
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

  public onFindClientes(ev) {
    this.onFindCancel(this);
    if (this.clientes) {
      let val = ev.target.value;
      if (val && val.trim() != '') {
        this.filterClientes = this.clientes.filter((cliente) => {
          return (cliente.Nombre.toLowerCase().indexOf(val.toLowerCase()) >
                  -1) ||
              (cliente.id.toString().toLowerCase().indexOf(val.toLowerCase()) >
               -1);
        });
      }
    }
  }

  public onFindCancel(ev) {
    this.filterClientes = this.clientes;
  }

  ionViewDidLoad() {
    this.getClientes();
  }

  private getClientes() {
    let load =
        this.loadCtrl.create({content: 'Buscando clientes de la sucursal...'});
    load.present().then(() => {
      this.clientesP.getAll().subscribe(
          (data: Cliente[]) => {
            load.dismiss();
            this.clientes = data;
            this.onFindCancel(this);
          },
          (error) => {
            console.log('Error:', error);
            load.dismiss();
          });
    });
  }
}
