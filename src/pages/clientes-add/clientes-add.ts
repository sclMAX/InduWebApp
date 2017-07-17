import {Component} from '@angular/core';
import {LoadingController, ToastController, ViewController} from 'ionic-angular';
import {ClientesProvider} from '../../providers/clientes/clientes';
import {Cliente} from './../../models/cliente.class';

@Component({
  selector: 'page-clientes-add',
  templateUrl: 'clientes-add.html',
})
export class ClientesAddPage {
  newCliente: Cliente;
  constructor(
      public viewCtrl: ViewController, private toastCtrl: ToastController,
      private loadCtrl: LoadingController,
      private clientesP: ClientesProvider) {
    this.newCliente = new Cliente();
    this.getCurrentId();
  }

  private async getCurrentId() {
    this.clientesP.getCurrentId().subscribe(
        (id) => {
          this.newCliente.id = (id >= 0) ? id + 1 : 0;
        },
        (error) => {
          console.log(error);
        });
  }

  onAceptar() {
    let load = this.loadCtrl.create({content: 'Guardando...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.clientesP.add(this.newCliente)
          .subscribe(
              (val) => {
                load.dismiss();
                this.viewCtrl.dismiss();
                toast.setMessage(val);
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

  onCancelar() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {}
}
