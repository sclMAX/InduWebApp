import {BancosProvider} from './../../../../providers/bancos/bancos';
import {BancosSucursalAmPage} from './../bancos-sucursal-am/bancos-sucursal-am';
import {Banco, BancoSucursal} from './../../../../models/fondos.clases';
import {Component} from '@angular/core';
import {
  ViewController,
  NavParams,
  ModalController,
  LoadingController,
  ToastController
} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'page-bancosam',
  templateUrl: 'bancosam.html',
})
export class BancosamPage {
  title: string;
  newBanco: Banco;
  oldBanco: Banco;
  isEdit: boolean = false;
  bancos: Banco[];
  private subscriptor: Subscription;
  isIdValid: boolean = true;
  isNombreValid: boolean = true;
  constructor(public viewCtrl: ViewController, public navParams: NavParams,
              private modalCtrl: ModalController,
              private bancosP: BancosProvider,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController) {
    this.oldBanco = this.navParams.get('Banco');
    if (this.oldBanco) {
      this.isEdit = true;
      this.title = `Editando ${ this.oldBanco.nombre}`;
      this.newBanco = JSON.parse(JSON.stringify(this.oldBanco));
    } else {
      this.getData();
      this.isEdit = false;
      this.title = 'Agregar Nuevo Banco...';
      this.newBanco = new Banco();
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptor) {
      this.subscriptor.unsubscribe();
    }
  }

  guardar() {
    let load = this.loadCtrl.create({content: 'Guardando Banco...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    let okAction = (ok) => {
      load.dismiss();
      this.viewCtrl.dismiss(this.newBanco);
      toast.setMessage(ok);
      toast.setDuration(1000);
      toast.present();
    };
    let errorAction = (error) => {
      load.dismiss();
      toast.setMessage(error);
      toast.setBackButtonText('OK');
      toast.setShowCloseButton(true);
      toast.present();
    };

    load.present().then(() => {
      if (this.isEdit) {
        this.bancosP.update(this.newBanco)
            .subscribe((ok) => { okAction(ok); },
                       (error) => { errorAction(error); });
      } else {
        this.bancosP.add(this.newBanco)
            .subscribe((ok) => { okAction(ok); },
                       (error) => { errorAction(error); });
      }
    });
  }

  cancelar() { this.viewCtrl.dismiss(); }

  addSucursal() {
    let addSucModal =
        this.modalCtrl.create(BancosSucursalAmPage, {Banco: this.newBanco},
                              {enableBackdropDismiss: false});
    addSucModal.present();
  }

  goSucursal(sucursal: BancoSucursal) {
    let editSucModal = this.modalCtrl.create(
        BancosSucursalAmPage, {Banco: this.newBanco, Sucursal: sucursal},
        {enableBackdropDismiss: false});
    editSucModal.onDidDismiss((data: Banco) => {
      if (data) {
        this.newBanco = data;
      }
    });
    editSucModal.present();
  }

  isUniqueId(): boolean {
    if (this.newBanco && this.bancos && !this.isEdit) {
      let existente =
          this.bancos.find((b) => { return b.id * 1 == this.newBanco.id * 1; });
      this.isIdValid = (existente) ? false : true;
    }
    return this.isIdValid;
  }

  isUniqueNombre(): boolean {
    if (this.newBanco && this.bancos && !this.isEdit) {
      let existente = this.bancos.find((b) => {
        if (this.isEdit) {
          return ((b.id * 1 != this.newBanco.id * 1) &&
                  (b.nombre && this.newBanco.nombre &&
                   (b.nombre.trim().toLowerCase() ==
                    this.newBanco.nombre.trim().toLowerCase())));
        } else {
          return (b.nombre && this.newBanco.nombre &&
                  (b.nombre.trim().toLowerCase() ==
                   this.newBanco.nombre.trim().toLowerCase()));
        }
      });
      this.isNombreValid = (existente) ? false : true;
    }
    return this.isNombreValid;
  }

  isValid(form): boolean {
    return form.valid && this.isIdValid && this.isNombreValid;
  }


  private async getData() {
    this.subscriptor =
        this.bancosP.getAll().subscribe((bancos) => { this.bancos = bancos; });
  }
}
