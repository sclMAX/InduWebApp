import {
  ClientesAddDescuentoPage
} from './../clientes-add-descuento/clientes-add-descuento';
import {Component} from '@angular/core';
import {
  LoadingController,
  NavController,
  NavParams,
  ToastController,
  ModalController
} from 'ionic-angular';
import {ClientesProvider} from '../../../providers/clientes/clientes';
import {Cliente, Telefono, Descuento} from './../../../models/clientes.clases';
import {Usuario} from './../../../models/user.class';
import {UsuarioProvider} from './../../../providers/usuario/usuario';

@Component({
  selector: 'page-clientes-add',
  templateUrl: 'clientes-add.html',
})
export class ClientesAddPage {
  title: string;
  newCliente: Cliente;
  private oldCliente: Cliente;
  isEdit: boolean = false;
  isShowDireccion: boolean = true;
  isShowTelefonos: boolean = true;
  isShowEmpresa: boolean = true;
  isShowComentarios: boolean = false;
  isShowDescuentos: boolean = false;
  usuario: Usuario = new Usuario();

  constructor(public navCtrl: NavController, public parametros: NavParams,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              private loadCtrl: LoadingController,
              private clientesP: ClientesProvider,
              private usuarioP: UsuarioProvider) {
    this.oldCliente = parametros.get('Cliente');
    if (this.oldCliente) {
      this.newCliente = JSON.parse(JSON.stringify(this.oldCliente));
      this.isEdit = true;
      this.title = 'Editar Cliente';
    } else {
      this.title = 'Nuevo Cliente';
      this.newCliente = new Cliente();
      this.getCurrentId();
    }
  }

  ngOnInit() { this.getUser(); }

  private async getCurrentId() {
    this.clientesP.getCurrentNewId().subscribe((id) => {
      this.newCliente.id = (id > 0) ? id : 0;
    }, (error) => { console.log(error); });
  }

  private async getUser() {
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }

  public onAceptar() {
    if (JSON.stringify(this.oldCliente) != JSON.stringify(this.newCliente)) {
      let load = this.loadCtrl.create({content: 'Guardando...'});
      let toast = this.toastCtrl.create({position: 'middle'});
      load.present().then(() => {
        if (this.isEdit) {
          this.clientesP.update(this.newCliente)
              .subscribe(
                  (ok) => {
                    load.dismiss();
                    this.navCtrl.pop();
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
                    this.navCtrl.pop();
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
    } else {
      this.navCtrl.pop();
    }
  }

  public onCancelar() {
    if (this.isEdit) {
      this.newCliente = this.oldCliente;
    }
    this.navCtrl.pop();
  }

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

  public removeTelefono(i) { this.newCliente.Telefonos.splice(i, 1); }

  getDescuentoAcumulado(): number {
    let desT: number = 0.00;
    if (this.newCliente && this.newCliente.Descuentos) {
      this.newCliente.Descuentos.forEach(
          (des) => { desT += des.Descuento * 1; });
    }
    return desT;
  }

  descuentoRemoveItem(desIdx) {
    if (this.newCliente && this.newCliente.Descuentos) {
      this.newCliente.Descuentos.splice(desIdx, 1);
    }
  }

  descuentoAddItem() {
    let desInsert = this.modalCtrl.create(ClientesAddDescuentoPage, {},
                                          {enableBackdropDismiss: false});
    desInsert.onDidDismiss((data: Descuento) => {
      if (this.usuario && this.usuario.MaxDescuentoItem && data &&
          data.Descuento) {
        let desRestante: number = (this.usuario.MaxDescuentoItem * 1) -
                                  (this.getDescuentoAcumulado() * 1);
        if ((data.Descuento * 1) <= desRestante) {
          if (!this.newCliente.Descuentos) {
            this.newCliente.Descuentos = [];
            this.newCliente.Descuentos.push(data);
          } else {
            let idx: number = this.newCliente.Descuentos.findIndex(
                (des) => { return des.id == data.id; });
            if (idx != -1) {
              this.newCliente.Descuentos[idx].Descuento =
                  this.newCliente.Descuentos[idx].Descuento * 1 +
                  data.Descuento * 1;
            } else {
              this.newCliente.Descuentos.push(data);
            }
          }
        } else {
          let toast = this.toastCtrl.create({
            message:
                'El descuento que intenta ingresar Excede el limite maximo autorizado!',
            showCloseButton: true,
            position: 'middle'
          });
          toast.present();
        }
      }
    });
    desInsert.present();
  }
}
