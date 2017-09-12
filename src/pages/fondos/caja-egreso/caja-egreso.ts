import {ChequesAmPage} from './../cheques/cheques-am/cheques-am';
import {
  PrintCajaEgresoPage
} from './../../documentos/print/print-caja-egreso/print-caja-egreso';
import {FondosProvider} from './../../../providers/fondos/fondos';
import {
  ChequesEnCarteraFindAndSelectPage
} from './../cheques-en-cartera-find-and-select/cheques-en-cartera-find-and-select';
import {ContadoresProvider} from './../../../providers/contadores/contadores';
import {
  CajaEgreso,
  Cheque,
  ChequeEntregadoPor
} from './../../../models/fondos.clases';
import {Component} from '@angular/core';
import {
  NavController,
  NavParams,
  ModalController,
  LoadingController,
  ToastController
} from 'ionic-angular';

@Component({
  selector: 'page-caja-egreso',
  templateUrl: 'caja-egreso.html',
})
export class CajaEgresoPage {
  title: string;
  egreso: CajaEgreso;
  isReadOnly: boolean = false;
  saldoEfectivo: number = 0.00;
  saldoDolares: number = 0.00;
  isEgreso: boolean = true;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private modalCtrl: ModalController,
              private contadoresP: ContadoresProvider,
              private fondosP: FondosProvider) {
    this.egreso = this.navParams.get('Egreso');
    this.isEgreso = this.navParams.get('isEgreso');

    if (this.egreso) {
      this.isReadOnly = true;
      this.title =
          `${(this.isEgreso)?'Egreso':'Ingreso'} Nro: ${this.egreso.id}`;
    } else {
      this.egreso = new CajaEgreso();
      this.getData();
      this.title = `Nuevo ${(this.isEgreso)?'Egreso':'Ingreso'} de Caja`;
      this.isReadOnly = false;
    }
  }

  calTotalCheques(): number {
    let total: number = 0.00;
    if (this.egreso && this.egreso.Cheques && this.egreso.Cheques.length > 0) {
      this.egreso.Cheques.forEach((c) => { total += Number(c.monto || 0); });
    }
    return total;
  }

  calTotal(): number {
    let total: number = 0.00;
    if (this.egreso) {
      total += Number(this.egreso.efectivo || 0);
      total += this.calTotalCheques();
    }
    return total;
  }

  chkEfectivo(): boolean {
    if (this.isReadOnly) {
      return true;
    }
    if (!this.isEgreso) {
      return (this.egreso.efectivo >= 0);
    }
    return ((this.egreso.efectivo >= 0) &&
            (this.egreso.efectivo <= this.saldoEfectivo));
  }

  chkDolares(): boolean {
    if (this.isReadOnly) {
      return true;
    }
    if (!this.isEgreso) {
      return (this.egreso.dolares >= 0);
    }
    return ((this.egreso.dolares >= 0) &&
            (this.egreso.dolares <= this.saldoDolares));
  }

  addCheque() {
    if (this.isEgreso) {
      let modal = this.modalCtrl.create(ChequesEnCarteraFindAndSelectPage,
                                        {Cheques: this.egreso.Cheques});
      modal.onDidDismiss((data) => {
        if (data && data.id) {
          if (!this.egreso.Cheques) {
            this.egreso.Cheques = [];
          }
          let idx = this.egreso.Cheques.findIndex(
              (c) => { return c.id === data.id; });
          if (idx > -1) {
            this.egreso.Cheques[idx] = data;
          } else {
            this.egreso.Cheques.push(data);
          }
        }
      });
      modal.present();
    } else {
      let newCheque = this.modalCtrl.create(ChequesAmPage, {},
                                            {enableBackdropDismiss: false});
      newCheque.onDidDismiss((data: Cheque) => {
        if (data) {
          if (this.egreso) {
            if (!this.egreso.Cheques) {
              this.egreso.Cheques = [];
            }
            data.EntregadoPor = new ChequeEntregadoPor();
            data.EntregadoPor.comentarios = this.egreso.tipo;
            this.egreso.Cheques.push(data);
          }
        }
      });
      newCheque.present();
    }
  }

  removeCheque(idx) { this.egreso.Cheques.splice(idx, 1); }

  goBack() { this.navCtrl.pop(); }

  aceptar() {
    let load = this.loadCtrl.create({content: 'Actualizando Caja...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    let okMsg = (ok) => {
      load.dismiss();
      toast.setMessage(ok);
      toast.setDuration(1000);
      toast.present();
      this.print();
    };
    let errorMsg = (error) => {
      load.dismiss();
      toast.setMessage(error);
      toast.setShowCloseButton(true);
      toast.setBackButtonText('OK');
      toast.present();
    };
    load.present().then(() => {
      if (this.isEgreso) {
        this.fondosP.addCajaEgreso(this.egreso)
            .subscribe((ok) => {
              this.navCtrl.pop();
              okMsg(ok);
            }, (error) => { errorMsg(error); });
      } else {
        this.fondosP.addCajaIngreso(this.egreso)
            .subscribe((ok) => {
              this.navCtrl.pop();
              okMsg(ok);
            }, (error) => { errorMsg(error); })
      }
    });
  }

  print() { this.navCtrl.push(PrintCajaEgresoPage, {Egreso: this.egreso}); }

  isValid(form): boolean {
    let res: boolean = false;
    res = form.valid;
    res = res && ((this.calTotal() > 0) || (Number(this.egreso.dolares) > 0));
    res = res && this.chkDolares();
    res = res && this.chkEfectivo();
    return res;
  }

  private async getData() {
    this.contadoresP.getCajaEgresoCurrentNro().subscribe(
        (data) => { this.egreso.id = data; });
    if (!this.isReadOnly && this.isEgreso) {
      this.fondosP.getSaldosEfectivo().subscribe((data) => {
        this.saldoDolares = data.saldoDolares;
        this.saldoEfectivo = data.saldoEfectivo;
      });
    }
  }
}
