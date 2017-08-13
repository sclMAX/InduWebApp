import {Component} from '@angular/core';
import {
  LoadingController,
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
              private loadCtrl: LoadingController){

  };

  public goClienteAdd() { this.navCtrl.push(ClientesAddPage); };

 

  public onFindClientes(ev) {
    this.onFindCancel(this);
    if (this.clientes) {
      let val: string = ev.target.value;
      if (val && val.trim() != '') {
        val = val.toLowerCase();
        this.filterClientes = this.clientes.filter((cliente) => {
          return (cliente.id && cliente.id.toString().toLowerCase().indexOf(val) > -1) ||
                 (cliente.nombre && cliente.nombre.toLowerCase().indexOf(val) > -1) ||
                 (cliente.email && cliente.email.toLowerCase().indexOf(val) > -1) ||
                 ((cliente.Direccion != null) &&
                  (( cliente.Direccion.calle && cliente.Direccion.calle.toLowerCase().indexOf(val) > -1) ||
                   (cliente.Direccion.localidad && cliente.Direccion.localidad.toLowerCase().indexOf(val) >
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
                   return tel.numero.toLowerCase().indexOf(val) > -1;
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
