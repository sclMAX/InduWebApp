import {ClientesAddPage} from './../clientes-add/clientes-add';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {Cliente} from './../../models/cliente.class';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  LoadingController,
  ModalController
} from 'ionic-angular';
@Component({
  selector: 'page-clientes',
  templateUrl: 'clientes.html',
})
export class ClientesPage {
  clientes: Array<Cliente>;
  filterClientes: Array<Cliente>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController,
              private modalCtrl: ModalController) {}

  goClienteAdd() {
    let clienteAddModal = this.modalCtrl.create(ClientesAddPage,{},{enableBackdropDismiss:false});
    clienteAddModal.present();
  }

  private getClientes() {
    let load =
        this.loadCtrl.create({content: 'Buscando clientes de la sucursal...'});
    load.present().then(() => {
      this.clientesP.Clientes.subscribe(
          (data: Cliente[]) => {
            load.dismiss();
            this.clientes = JSON.parse(JSON.stringify(data));
            console.log('this.clientes:', this.clientes);
            this.onFindCancel(this);
          },
          (error) => {
            console.log('Error:', error);
            load.dismiss();
          });
    });
  }

  onFindClientes(ev) {
    this.onFindCancel(this);
    if (this.clientes) {
      let val = ev.target.value;
      if (val && val.trim() != '') {
        this.filterClientes = this.clientes.filter((cliente) => {
          console.log('CLiente:', cliente);
          return (cliente.Nombre.toLowerCase().indexOf(val.toLowerCase()) >
                  -1) ||
                 (cliente.Direccion.Localidad.toLowerCase().indexOf(
                      val.toLowerCase()) > -1) ||
                 (cliente.Direccion.Calle.toLowerCase().indexOf(
                      val.toLowerCase()) > -1) ||
                 (cliente.idCliente.toString().toLowerCase().indexOf(
                      val.toLowerCase()) > -1);
        });
      }
    }
  }

  onFindCancel(ev) { this.filterClientes = this.clientes; }

  ionViewDidLoad() { this.getClientes(); }
}
