import {PrintPagoPage} from './../../documentos/print/print-pago/print-pago';
import {PAGO} from './../../../models/pedidos.clases';
import {PagosProvider} from './../../../providers/pagos/pagos';
import {ContadoresProvider} from './../../../providers/contadores/contadores';
import {DolarProvider} from './../../../providers/dolar/dolar';
import {ChequesAmPage} from './../../fondos/cheques/cheques-am/cheques-am';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {
  ClientePago,
  Cliente,
  ClientePagoCheque
} from './../../../models/clientes.clases';
import {Component} from '@angular/core';
import {
  NavParams,
  ModalController,
  NavController,
  LoadingController,
  ToastController
} from 'ionic-angular';

@Component({
  selector: 'page-clientes-add-pago',
  templateUrl: 'clientes-add-pago.html',
})
export class ClientesAddPagoPage {
  title: string;
  newPago: ClientePago;
  cliente: Cliente;
  isViewOnly: boolean = false;
  saldoCliente: number = 0.00;
  showEfectivo: boolean = true;
  showDatos: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private ctacteP: CtasCtesProvider,
              private modalCtrl: ModalController, private dolarP: DolarProvider,
              private contadoresP: ContadoresProvider,
              private pagosP: PagosProvider) {
    this.cliente = this.navParams.get('Cliente');
    this.newPago = this.navParams.get('Pago');
    if (this.cliente) {
      if (this.newPago) {
        this.title =
            `Pago ${this.newPago.numero} Cliente ${this.cliente.nombre}...`;
        this.isViewOnly = true;
      } else {
        this.newPago = new ClientePago();
        this.newPago.tipo = PAGO;
        this.newPago.idCliente = this.cliente.id;
        this.title = `Nuevo Pago Cliente ${this.cliente.nombre}...`;
        this.isViewOnly = false;
      }
      this.getData();
    } else {
      this.navCtrl.pop();
    }
  }

  addCheque() {
    let newCheque = this.modalCtrl.create(ChequesAmPage, {},
                                          {enableBackdropDismiss: false});
    newCheque.onDidDismiss((data) => {
      if (data) {
        if (this.newPago) {
          if (!this.newPago.Cheques) {
            this.newPago.Cheques = [];
          }
          let cheque = new ClientePagoCheque();
          cheque.Dolar = JSON.parse(JSON.stringify(this.newPago.RefDolar));
          cheque.Cheque = data;
          this.newPago.Cheques.push(cheque);
        }
      }
    });
    newCheque.present();
  }
  removeCheque(idx: number) { this.newPago.Cheques.splice(idx, 1); }

  calSandoActual(): number {
    if (this.newPago.isInCtaCte) {
      return this.saldoCliente;
    }
    return this.saldoCliente - this.calTotalPago();
  }

  calTotalPago(): number {
    if (this.isViewOnly) {
      return this.newPago.totalFinalUs;
    }
    if (this.newPago && this.newPago.RefDolar) {
      let res: number = 0.00;
      res = (this.newPago.efectivo * 1 || 0) /
            (this.newPago.RefDolar.valor * 1 || 1);
      res += (this.newPago.dolares * 1 || 0);
      if (this.newPago.Cheques) {
        this.newPago.Cheques.forEach((c) => {
          res += (c.Cheque.monto * 1 || 0) / (c.Dolar.valor * 1 || 1);
        });
      }
      this.newPago.totalFinalUs = res;
      return res;
    }
    return 0.00;
  }

  goBack() { this.navCtrl.pop(); }

  aceptar() {
    let load = this.loadCtrl.create({content: 'Guardando Pago...'});
    let toast = this.toastCtrl.create({position: 'middle'});
    load.present().then(() => {
      this.pagosP.add(this.newPago)
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
    });
  }

  print() {
    this.navCtrl.push(PrintPagoPage,
                      {Cliente: this.cliente, Pago: this.newPago});
  }

  isValid(): boolean {
    let res: boolean = false;
    if (this.newPago) {
      res = this.calTotalPago() > 0;
    }
    return res;
  }
  private async getData() {
    if (!this.isViewOnly && this.newPago) {
      this.contadoresP.getPagosCurrentNro().subscribe(
          (nro) => { this.newPago.id = nro; });
      let dp = this.dolarP.getDolar().subscribe((dolar) => {
        this.newPago.RefDolar = JSON.parse(JSON.stringify(dolar));
        dp.unsubscribe();
      });
    }
    this.ctacteP.getSaldoCliente(this.cliente.id)
        .subscribe((saldo) => { this.saldoCliente = saldo; });
  }
}
