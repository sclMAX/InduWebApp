import {FondosProvider} from './../../../../providers/fondos/fondos';
import {Cliente} from './../../../../models/clientes.clases';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {Observable} from 'rxjs/Observable';
import {Cheque} from './../../../../models/fondos.clases';
import {
  NavParams,
  ViewController,
  LoadingController,
  ToastController
} from 'ionic-angular';
import {Component} from '@angular/core';

@Component({
  selector: 'page-cheque-rechazar',
  templateUrl: 'cheque-rechazar.html',
})
export class ChequeRechazarPage {
  title: string;
  cheque: Cheque;
  cliente: Observable<Cliente>;
  gastos: number = 0.00;
  comentarios: string;
  constructor(public viewCtrl: ViewController, public navParams: NavParams,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private clientesP: ClientesProvider,
              private fondosP: FondosProvider) {
    this.cheque = this.navParams.get('Cheque');
    if (this.cheque) {
      this.title = `Cheque ${this.cheque.id} Rechazado...`;
      this.cliente = this.clientesP.getOne(this.cheque.EntregadoPor.idCliente);
    } else {
      this.goBack();
    }
  }

  ionViewDidLoad() {}

  goBack() { this.viewCtrl.dismiss(); }

  isValid(form): boolean {
    let r: boolean = form.valid;
    r = r && this.gastos >= 0;
    return r;
  }

  calTotalNotaDebitoUs(): number {
    let t: number = 0.00;
    if (this.cheque && this.cheque.refDolar) {
      t = this.cheque.monto / this.cheque.refDolar;
      t += (this.gastos || 0) / this.cheque.refDolar;
    }
    return t;
  }

  aceptar() {
    let load = this.loadCtrl.create(
        {content: 'Actualizando y Creando Nota de Debito...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.fondosP.setChequeRechazado(this.cheque, this.gastos,
                                      this.comentarios)
          .subscribe(
              (ok) => {
                this.viewCtrl.dismiss();
                load.dismiss();
                toast.setMessage(ok);
                toast.setDuration(1000);
                toast.present();
              },
              (error) => {
                load.dismiss();
                toast.setMessage(error);
                toast.setShowCloseButton(true);
                toast.setBackButtonText('OK');
                toast.present();
              });
    });
  }
}
