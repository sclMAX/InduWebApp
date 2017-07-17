import {Component} from '@angular/core';
import {
  LoadingController,
  ToastController,
  ViewController,
  NavParams
} from 'ionic-angular';
import {ClientesProvider} from '../../../providers/clientes/clientes';
import {Cliente, Telefono} from './../../../models/cliente.class';

@Component({
  selector: 'page-clientes-add',
  templateUrl: 'clientes-add.html',
})
export class ClientesAddPage {
  title: string;
  newCliente: Cliente;
  private oldCliente: Cliente;
  isEdit: boolean = false;
  isShowDireccion: boolean = false;
  isShowTelefonos: boolean = false;
  isShowEmpresa: boolean = true;
  isShowComentarios: boolean = false;

  constructor(public viewCtrl: ViewController, public parametros: NavParams,
              private toastCtrl: ToastController,
              private loadCtrl: LoadingController,
              private clientesP: ClientesProvider) {
    this.oldCliente = parametros.get('Cliente');
    if (this.oldCliente) {
      this.newCliente = JSON.parse(JSON.stringify(this.oldCliente));
      this.isEdit = true;
      this.title = "Editar Cliente";
    } else {
      this.title = "Nuevo Cliente";
      this.newCliente = new Cliente();
      this.getCurrentId();
    }
  }

  private async getCurrentId() {
    this.clientesP.getCurrentId().subscribe((id) => {
      this.newCliente.id = (id >= 0) ? id + 1 : 0;
    }, (error) => { console.log(error); });
  }

  onAceptar() {
    if (JSON.stringify(this.oldCliente) != JSON.stringify(this.newCliente)) {
      let load = this.loadCtrl.create({content: 'Guardando...'});
      let toast = this.toastCtrl.create({position: 'middle'});
      load.present().then(() => {
        if (this.isEdit) {
          this.clientesP.update(this.newCliente)
              .subscribe(
                  (ok) => {
                    load.dismiss();
                    this.viewCtrl.dismiss();
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
        } else {
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
        }
      });
    }else{
      this.viewCtrl.dismiss();
    }
  }

  onCancelar() {
    console.log('NEW:', this.newCliente);
    console.log('OLD:', this.oldCliente);
    if (this.isEdit) {
      this.newCliente = this.oldCliente;

      console.log('NEW:', this.newCliente);
    }
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {}

  public chkDireccionForm(): boolean {
    return ((this.newCliente.Direccion.Calle != null) &&
            (this.newCliente.Direccion.Calle.trim().length > 0)) &&
           ((this.newCliente.Direccion.Localidad != null) &&
            (this.newCliente.Direccion.Localidad.trim().length > 0)) &&
           ((this.newCliente.Direccion.Provincia != null) &&
            (this.newCliente.Direccion.Provincia.trim().length > 0)) &&
           ((this.newCliente.Direccion.Pais != null) &&
            (this.newCliente.Direccion.Pais.trim().length > 0));
  }

  public chkEmpresaForm(): boolean {
    return (((this.newCliente.Nombre != null) &&
             (this.newCliente.Nombre.trim().length > 0)) &&
            ((this.newCliente.Email != null) &&
             (this.newCliente.Email.trim().length > 0)));
  }

  public chkTelefonosForm(): boolean {
    return ((this.newCliente.Telefonos != null));
  }

  public addTelefono() { this.newCliente.Telefonos.push(new Telefono()); }

  public removeTelefono(i) {
    console.log('remove:', i);
    this.newCliente.Telefonos.splice(i, 1);
  }
}
