import {DolarProvider} from './../../../providers/dolar/dolar';
import {Dolar} from './../../../models/fondos.clases';
import {ChequesAmPage} from './../../fondos/cheques/cheques-am/cheques-am';
import {CtasCtesProvider} from './../../../providers/ctas-ctes/ctas-ctes';
import {
  ClientePago,
  Cliente,
  ClientePagoCheque
} from './../../../models/clientes.clases';
import {Component} from '@angular/core';
import {NavParams, ModalController, NavController} from 'ionic-angular';

@Component({
  selector: 'page-clientes-add-pago',
  templateUrl: 'clientes-add-pago.html',
})
export class ClientesAddPagoPage {
  title: string;
  newPago: ClientePago;
  cliente: Cliente;
  dolar: Dolar;
  saldoCliente: number = 0.00;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private ctacteP: CtasCtesProvider,
              private modalCtrl: ModalController,
              private dolarP: DolarProvider) {
    this.cliente = this.navParams.get('Cliente');
    if (this.cliente) {
      this.newPago = new ClientePago();
      this.title = `Nuevo Pago Cliente ${this.cliente.Nombre}...`;
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
          cheque.Dolar = JSON.parse(JSON.stringify(this.dolar));
          cheque.Cheque = data;
          this.newPago.Cheques.push(cheque);
        }
      }
    });
    newCheque.present();
  }
  removeCheque(idx: number) { this.newPago.Cheques.splice(idx, 1); }

  calSandoActual(): number { return this.saldoCliente - this.calTotalPago(); }

  calTotalPago(): number {
    if (this.newPago && this.newPago.RefDolar) {
      let res: number = 0.00;
      res = (this.newPago.Efectivo * 1 || 0) / (this.dolar.Valor * 1 || 1);
      res += (this.newPago.Dolares * 1 || 0);
      if (this.newPago.Cheques) {
        this.newPago.Cheques.forEach(
            (c) => { res += (c.Cheque.Monto * 1 || 0) / (c.Dolar.Valor * 1 || 1); });
      }
      return res;
    }
    return 0.00;
  }

  goBack() { this.navCtrl.pop(); }


  private async getData() {
    this.ctacteP.getSaldoCliente(this.cliente.id)
        .subscribe((saldo) => { this.saldoCliente = saldo; });
    this.dolarP.getDolar().subscribe((dolar) => {
      if (!this.dolar) {
        this.dolar = (dolar) ? dolar : new Dolar();
        this.newPago.RefDolar = this.dolar;
      }
    });
  }
}
