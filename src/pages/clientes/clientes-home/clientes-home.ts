import {Component} from '@angular/core';
import {
  LoadingController,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import {Cliente} from './../../../models/clientes.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {ClientesAddPage} from './../clientes-add/clientes-add';

@Component({
  selector: 'page-clientes',
  templateUrl: 'clientes-home.html',
})
export class ClientesHomePage {
  clientes: Cliente[];
  filterClientes: Cliente[];
  showComandos: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private clientesP: ClientesProvider,
              private loadCtrl: LoadingController,
              private modalCtrl: ModalController){

  };

  public goClienteAdd() {
    let clienteAddModal = this.modalCtrl.create(ClientesAddPage, {},
                                                {enableBackdropDismiss: false});
    clienteAddModal.present();
  };

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
  };

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
  };

  public onFindCancel(ev) { this.filterClientes = this.clientes; };

  ionViewDidLoad() { this.getClientes(); };

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
  };
}
