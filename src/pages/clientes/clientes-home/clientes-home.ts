import { SUCURSAL } from './../../../providers/sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Cliente} from './../../../models/clientes.clases';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {ClientesAddPage} from './../clientes-add/clientes-add';

@Component({
  selector: 'page-clientes',
  templateUrl: 'clientes-home.html',
})
export class ClientesHomePage {
  title:string;
  totalClientes: number = -1;
  filterClientes: Observable<Cliente[]>;
  showComandos: boolean = true;

  constructor(public navCtrl: NavController,
              private clientesP: ClientesProvider){
                this.title = `Suc. ${SUCURSAL} - Clientes`;
  };

  public goClienteAdd() { this.navCtrl.push(ClientesAddPage); };

  public onFindClientes(ev) {
    this.onFindCancel();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.toLowerCase();
      this.filterClientes =
          this.clientesP.getAll()
              .map((clientes) => {
                return clientes.filter((cliente) => {
                  return (cliente.id &&
                          cliente.id.toString().toLowerCase().indexOf(val) >
                              -1) ||
                         (cliente.nombre &&
                          cliente.nombre.toLowerCase().indexOf(val) > -1) ||
                         (cliente.email &&
                          cliente.email.toLowerCase().indexOf(val) > -1) ||
                         ((cliente.Direccion != null) &&
                          ((cliente.Direccion.calle &&
                            cliente.Direccion.calle.toLowerCase().indexOf(val) >
                                -1) ||
                           (cliente.Direccion.localidad &&
                            cliente.Direccion.localidad.toLowerCase().indexOf(
                                val) > -1)));
                });
              })
              .map(clientes => {
                this.totalClientes = clientes.length;
                return clientes;
              });
    }
  };

  public onFindClientesTelefono(ev) {
    this.onFindCancel();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.toLowerCase();
      this.filterClientes =
          this.clientesP.getAll()
              .map((clientes) => {
                return clientes.filter((cliente) => {
                  return (cliente.Telefonos.filter((tel) => {
                           return tel.numero.toLowerCase().indexOf(val) > -1;
                         })).length > 0;
                });
              })
              .map(clientes => {
                this.totalClientes = clientes.length;
                return clientes;
              });
    }
  };

  public onFindCancel() {
    this.filterClientes = this.clientesP.getAll().map((clientes) => {
      this.totalClientes = clientes.length;
      return clientes;
    });
  };

  ionViewDidLoad() { this.getClientes(); };

  private async getClientes() {
    this.filterClientes = this.clientesP.getAll().map((clientes) => {
      this.totalClientes = clientes.length;
      return clientes;
    });
  }
}
