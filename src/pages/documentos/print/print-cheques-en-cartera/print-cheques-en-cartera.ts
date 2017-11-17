import { Observable } from 'rxjs/Observable';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { FECHA } from '../../../../models/comunes.clases';

import { Cliente } from './../../../../models/clientes.clases';
import { Cheque } from './../../../../models/fondos.clases';
import { ClientesProvider } from './../../../../providers/clientes/clientes';

@Component({
  selector: 'page-print-cheques-en-cartera',
  templateUrl: 'print-cheques-en-cartera.html',
})
export class PrintChequesEnCarteraPage {
  title: string = 'Listado de Cheques en Cartera';
  isPrint: boolean = false;
  fecha: string = moment().format(FECHA);
  cheques: Cheque[];
  private clientes: Array<{ id: number, Data: Observable<Cliente> }> = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private clientesP: ClientesProvider) {
    this.cheques = this.navParams.get('Cheques');
    this.title = (this.navParams.get('Title')) ? this.navParams.get('Title') :
      this.title;
    if (!this.cheques) {
      this.navCtrl.pop();
    }
  }

  getCliente(cheque: Cheque): Observable<Cliente> {
    if (cheque) {
      let clientes = this.clientes.find(c => c.id == cheque.EntregadoPor.idCliente);
      if (clientes) {
        return clientes.Data;
      } else {
        this.clientes.push({
          id: cheque.EntregadoPor.idCliente,
          Data: this.clientesP.getOne(cheque.EntregadoPor.idCliente)
        });
      }
    }
  }

  calDias(cheque: Cheque): number {
    if (cheque) {
      return moment(cheque.fechaCobro, FECHA).diff(moment(), 'days');
    }
    return 0;
  }

  calTotal(cheques: Cheque[]): number {
    if (cheques) {
      return cheques.reduce((sum, data) => sum + Number(data.monto), 0);
    }
    return 0.00;
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }

  goBack() { this.navCtrl.pop(); }
}
