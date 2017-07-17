import { DocumentosAddPage } from './../documentos-add/documentos-add';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {Cliente} from './../../../models/cliente.class';
import {Component} from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import {ClientesAddPage} from './../clientes-add/clientes-add';

@Component({
  selector: 'page-clientes',
  templateUrl: 'clientes-home.html',
})
export class ClientesHomePage {
  clientes: Cliente[];
  filterClientes: Cliente[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController,
              private modalCtrl: ModalController,
              private alerCtrl: AlertController,
              private toastCtrl: ToastController) {}


  public goClienteAdd(cliente: Cliente) {
    let clienteAddModal = this.modalCtrl.create(
        ClientesAddPage, {Cliente: cliente}, {enableBackdropDismiss: false});
    clienteAddModal.present();
  }

  public newDocumento(cliente:Cliente){
    this.navCtrl.push(DocumentosAddPage, {Cliente:cliente});
  }

  public showTelefonos(cliente: Cliente) {
    let alert = this.alerCtrl.create({title: 'TELEFONOS', buttons: ['OK']});
    let msg: string = '';
    cliente.Telefonos.forEach(
        (tel) => { msg += `<h5>${tel.Contacto}: ${tel.Numero}</h5>`; });
    alert.setMessage(msg);
    alert.present();
  }

  public removeCliente(cliente: Cliente) {
    let alert = this.alerCtrl.create({
      title: 'Eliminar?',
      subTitle:
          `Esta seguro que quiere ELIMINAR definitivamete el cliente: ${cliente
              .Nombre}?`,
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
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
      let val: string = ev.target.value;
      if (val && val.trim() != '') {
        val = val.toLowerCase();
        this.filterClientes = this.clientes.filter((cliente) => {
          return (cliente.id.toString().toLowerCase().indexOf(val) > -1) ||
                 (cliente.Nombre.toLowerCase().indexOf(val) > -1) ||
                 (cliente.Email.toLowerCase().indexOf(val) > -1) ||
                 ((cliente.Direccion != null) &&
                  ((cliente.Direccion.Calle.toLowerCase().indexOf(val) > -1) ||
                   (cliente.Direccion.Localidad.toLowerCase().indexOf(val) >
                    -1)));
        });
      }
    }
  }

  public onFindClientesTelefono(ev) {
    this.onFindCancel(this);
    if (this.clientes) {
      let val: string = ev.target.value;
      if (val && val.trim() != '') {
        val = val.toLowerCase();
        this.filterClientes = this.clientes.filter((cliente) => {
          return (cliente.Telefonos.filter((tel) => {
                   return tel.Numero.toLowerCase().indexOf(val) > -1;
                 })).length > 0;
        });
      }
    }
  }

  public onFindCancel(ev) { this.filterClientes = this.clientes; }

  ionViewDidLoad() { this.getClientes(); }

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
