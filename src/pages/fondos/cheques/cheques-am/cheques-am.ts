import {FondosProvider} from './../../../../providers/fondos/fondos';
import {Component} from '@angular/core';
import {ModalController, NavParams, ViewController} from 'ionic-angular';
import * as moment from 'moment';

import {Cliente} from './../../../../models/clientes.clases';
import {FECHA} from './../../../../models/comunes.clases';
import {
  Banco,
  BancoSucursal,
  Cheque,
  ChequeFirmante,
  validaCuit
} from './../../../../models/fondos.clases';
import {BancosProvider} from './../../../../providers/bancos/bancos';
import {ClientesProvider} from './../../../../providers/clientes/clientes';
import {BancosamPage} from './../../bancos/bancosam/bancosam';

@Component({
  selector: 'page-cheques-am',
  templateUrl: 'cheques-am.html',
})
export class ChequesAmPage {
  title: string;
  newCheque: Cheque;
  oldCheque: Cheque;
  cliente: Cliente;
  isEdit: boolean = false;
  bancos: Banco[] = [];
  selBanco: Banco;
  selSucursal: BancoSucursal;
  errorMsgFechaEmision: string = '';
  errorMsgFechaCobro: string = '';
  constructor(public viewCtrl: ViewController, public navParams: NavParams,
              private bancosP: BancosProvider,
              private modalCtrl: ModalController,
              private clientesP: ClientesProvider,
              private fondosP: FondosProvider) {
    this.oldCheque = this.navParams.get('Cheque');
    if (this.oldCheque) {
      this.newCheque = JSON.parse(JSON.stringify(this.oldCheque));
      this.isEdit = true;
      this.title = `Cheque ${this.newCheque.id}`;
      this.clientesP.getOne(this.newCheque.EntregadoPor.idCliente)
          .subscribe((data) => { this.cliente = data; });
    } else {
      this.getData();
      this.newCheque = new Cheque();
      this.newCheque.Firmantes[0] = new ChequeFirmante();
      this.isEdit = false;
      this.title = 'Ingresar Cheque...';
    }
  }

  private async getData() {
    this.bancosP.getAll().subscribe((bancos) => { this.bancos = bancos; });
  }

  cancelar() { this.viewCtrl.dismiss(); }

  aceptar() {
    this.newCheque.id = `${this.newCheque.idBanco}-${this.newCheque.idSucursal
        }-${this.newCheque.numero}`;
    this.viewCtrl.dismiss(this.newCheque);
  }

  chkBanco(): boolean {
    if (!this.isEdit && this.bancos) {
      this.selBanco = this.bancos.find(
          (b) => { return (b.id * 1 == this.newCheque.idBanco * 1); });
      return this.selBanco != null;
    }
    return false;
  }

  async getFirmante(firmante: ChequeFirmante) {
    this.fondosP.getFirmante(firmante.CUIT)
        .subscribe((data) => {
          if (data && data.nombre != '') {
            firmante.nombre = data.nombre;
          }
        });
  }

  chkSucursal(): boolean {
    if (!this.isEdit && this.selBanco && this.selBanco.Sucursales) {
      this.selSucursal = this.selBanco.Sucursales.find(
          (s) => { return (s.id * 1 == this.newCheque.idSucursal * 1); });
      return this.selSucursal != null;
    }
    return false;
  }

  addBanco() {
    let addModal =
        this.modalCtrl.create(BancosamPage, {}, {enableBackdropDismiss: false});
    addModal.onDidDismiss((data) => {
      if (data) {
        this.selBanco = data;
        this.newCheque.idBanco = this.selBanco.id;
      }
    });
    addModal.present();
  }

  addSucursal() {
    if (this.selBanco) {
      let addModal = this.modalCtrl.create(BancosamPage, {Banco: this.selBanco},
                                           {enableBackdropDismiss: false});
      addModal.onDidDismiss((data) => {
        if (data) {
          this.selBanco = data;
          this.newCheque.idBanco = this.selBanco.id;
        }
      });
      addModal.present();
    }
  }

  addFirmante() {
    if (this.newCheque && this.newCheque.Firmantes) {
      this.newCheque.Firmantes.push(new ChequeFirmante());
    }
  }
  removeFirmante(idx) { this.newCheque.Firmantes.splice(idx, 1); }

  chkFechaEmision(): boolean {
    if (this.newCheque.fechaEmision) {
      let fi = moment(this.newCheque.fechaIngreso, FECHA, true);
      let fe = moment(this.newCheque.fechaEmision, FECHA, true);
      if (fe.isValid()) {
        let dif = fe.diff(fi, 'days');
        if (dif <= 0) {
          return true;
        } else {
          this.errorMsgFechaEmision = 'F. Emision > F. Ingreso!';
        }
      } else {
        this.errorMsgFechaEmision = 'Fecha incorrecta! ej.(dd/mm/yyyy)';
        return false;
      }
    }
    return false;
  }

  chkFechaCobro(): boolean {
    if (this.newCheque.fechaCobro) {
      let fi = moment(this.newCheque.fechaIngreso, FECHA, true);
      let fe = moment(this.newCheque.fechaEmision, FECHA, true);
      let fc = moment(this.newCheque.fechaCobro, FECHA, true);
      if (fc.isValid()) {
        if (fc.diff(fe, 'days') > -1) {
          if (fc.diff(fe, 'years') < 1) {
            if (fi.diff(fc, 'days') < 30) {
              return true;
            } else {
              this.errorMsgFechaCobro = 'Cheque vencido!';
            }
          } else {
            this.errorMsgFechaCobro = 'F. Cobro > 1 Año!'
          }
        } else {
          this.errorMsgFechaCobro = 'F. Cobro < F. Emision!';
        }
      } else {
        this.errorMsgFechaCobro = 'Fecha incorrecta! ej.(dd/mm/yyyy)';
      }
    }
    return false;
  }

  chkMonto(): boolean {
    if (this.newCheque && this.newCheque.monto) {
      if (this.newCheque.monto > 0) {
        return true;
      }
    }
    return false;
  }

  chkCuit(firmante: ChequeFirmante): boolean {
    if (firmante && firmante.CUIT) {
      if (validaCuit(firmante.CUIT.toString())) {
        if (!firmante.nombre || firmante.nombre == '') {
          this.getFirmante(firmante);
        }
        return true;
      }
    }
    return false;
  }

  isValid(form): boolean {
    let res: boolean = false;
    res = form.valid;
    res = res && this.chkBanco();
    res = res && this.chkSucursal();
    res = res && this.chkFechaEmision();
    res = res && this.chkFechaCobro();
    res = res && this.chkMonto();
    this.newCheque.Firmantes.forEach((f) => { res = res && this.chkCuit(f); });
    return res;
  }
}
