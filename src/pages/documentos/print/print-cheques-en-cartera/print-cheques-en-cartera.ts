import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';

import {FECHA} from '../../../../models/comunes.clases';

import {Cliente} from './../../../../models/clientes.clases';
import {Cheque} from './../../../../models/fondos.clases';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {FondosProvider} from './../../../../providers/fondos/fondos';

@Component({
  selector: 'page-print-cheques-en-cartera',
  templateUrl: 'print-cheques-en-cartera.html',
})
export class PrintChequesEnCarteraPage {
  isPrint: boolean = false;
  fecha: string = moment().format(FECHA);
  cheques: Cheque[] = [];
  private clientes: Cliente[] = [];
  constructor(
      public navCtrl: NavController, public navParams: NavParams,
      private fondosP: FondosProvider, private clientesP: ClientesProvider) {
    this.cheques = this.navParams.get('Cheques');
    if (!this.cheques || !(this.cheques.length > 0)) {
      this.getData();
    } else {
      this.getClientes(this.cheques);
    }
  }

  getCliente(cheque: Cheque): Cliente {
    if (cheque) {
      return this.clientes.find((c) => {
        return c.id == cheque.EntregadoPor.idCliente;
      });
    }
  }

  calDias(cheque: Cheque): number {
    if (cheque) {
      return moment(cheque.fechaCobro, FECHA).diff(moment(), 'days');
      }
    return 0;
  }

  calTotal(): number {
    let total: number = 0.00;
    if (this.cheques) {
      this.cheques.forEach((c) => {
        total += Number(c.monto);
      });
      }
    return total;
  }

  goPrint() {
    this.isPrint = true;
    setTimeout(() => {
      window.print();
      this.goBack();
    }, 10);
  }

  goBack() {
    this.navCtrl.pop();
  }

  private async getClientes(data) {
    this.clientes = [];
    data.forEach((d) => {
      this.clientesP.getOne(d.EntregadoPor.idCliente).subscribe((cliente) => {
        this.clientes.push(cliente);
      });
    });
  }

  private async getData() {
    this.fondosP.getChequesEnCartera().subscribe((data) => {
      this.cheques = data;
      this.getClientes(data);
    });
  }
}
