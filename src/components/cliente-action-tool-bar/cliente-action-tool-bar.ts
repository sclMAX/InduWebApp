import {
  ClientesAddPage
} from './../../pages/clientes/clientes-add/clientes-add';
import {ClientesProvider} from './../../providers/clientes/clientes';
import {
  DocumentosAddPage
} from './../../pages/clientes/documentos-add/documentos-add';
import {Cliente} from './../../models/clientes.clases';
import {Component, Input} from '@angular/core';
import {
  AlertController,
  NavController,
  LoadingController,
  ToastController,
  ModalController
} from "ionic-angular";

@Component({
  selector: 'cliente-action-tool-bar',
  templateUrl: 'cliente-action-tool-bar.html'
})
export class ClienteActionToolBarComponent {
  @Input('cliente') cliente: Cliente;
  @Input('color') color:string;

  constructor(private alertCtrl: AlertController,
              private navCtrl: NavController,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private clientesP: ClientesProvider,
              private modalCtrl: ModalController) {}

  ngOnInit() {}

  public showTelefonos(cliente: Cliente) {
    let alert = this.alertCtrl.create({title: 'TELEFONOS', buttons: ['OK']});
    let msg: string = '';
    cliente.Telefonos.forEach(
        (tel) => { msg += `<h5>${tel.Contacto}: ${tel.Numero}</h5>`; });
    alert.setMessage(msg);
    alert.present();
  }

  public newDocumento(cliente: Cliente) {
    this.navCtrl.push(DocumentosAddPage, {Cliente: cliente});
  }

  public goClienteUpdate(cliente: Cliente) {
    let clienteAddModal = this.modalCtrl.create(
        ClientesAddPage, {Cliente: cliente}, {enableBackdropDismiss: false});
    clienteAddModal.present();
  }

  public removeCliente(cliente: Cliente) {
    let alert = this.alertCtrl.create({
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
}
