import {Component} from '@angular/core';
import {LoadingController, ToastController, ViewController} from 'ionic-angular';
import {Observable} from 'rxjs/Observable';

import {ClientesProvider} from '../../providers/clientes/clientes';

import { Cliente, Direccion, Telefono } from './../../models/cliente.class';

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
    this.clientesP.getCurrentId().subscribe((id) => {
      this.newCliente.id = (id >= 0) ? id + 1 : 0;
    },(error)=>{
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

  pruebaSobrecarga(n, t) {
    this.newCliente.Nombre = `Prueba Sobrecarga Nro:${n}`;
    this.newCliente.Direccion = new Direccion();
    this.newCliente.Direccion.Calle = `Calle Nro:${n}`;
    this.newCliente.Direccion.Localidad = `Localidad Nro:${n}`;
    this.newCliente.Direccion.Pais = `Pais Nro:${n}`;
    this.newCliente.Direccion.Provincia= `Provincia Nro:${n}`;
    this.newCliente.Email = `email${n}@gmail.com`;
    this.newCliente.Telefonos.push({Numero:34342606 + n, Contacto: `Contacto Nro:${n}`});
    this.newCliente.Comentarios = `Esto es una Prueba Sobrecarga Nro:${n}`;
    console.log(this.newCliente.id, ' - ', this.newCliente.Nombre);
    this.clientesP.add(this.newCliente)
        .subscribe(
            (ok) => {

            },
            (error) => {

            },
            () => {
              if (n < t) {
                this.pruebaSobrecarga(n + 1, t)
              }else{
                this.viewCtrl.dismiss();
              }
            });
  }

  ionViewDidLoad() {}
}
