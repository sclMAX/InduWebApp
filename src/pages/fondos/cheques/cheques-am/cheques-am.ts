import {Component} from '@angular/core';
import {ModalController, NavParams, ViewController} from 'ionic-angular';
import * as moment from 'moment';

import {FFECHA} from './../../../../models/db-base-paths';
import {
  Banco,
  BancoSucursal,
  Cheque,
  ChequeFirmante,
  validaCuit
} from './../../../../models/fondos.clases';
import {BancosProvider} from './../../../../providers/bancos/bancos';
import {BancosamPage} from './../../bancos/bancosam/bancosam';

@Component({
  selector: 'page-cheques-am',
  templateUrl: 'cheques-am.html',
})
export class ChequesAmPage {
  title: string;
  newCheque: Cheque;
  oldCheque: Cheque;
  isEdit: boolean = false;
  bancos: Banco[] = [];
  selBanco: Banco;
  selSucursal: BancoSucursal;
  errorMsgFechaEmision: string = '';
  errorMsgFechaCobro: string = '';
  constructor(public viewCtrl: ViewController, public navParams: NavParams,
              private bancosP: BancosProvider,
              private modalCtrl: ModalController) {
    this.oldCheque = this.navParams.get('Cheque');
    if (this.oldCheque) {
      this.newCheque = JSON.parse(JSON.stringify(this.oldCheque));
      this.isEdit = true;
      this.title = `Editar Cheque [${this.newCheque.id}]...`;
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

  aceptar() { this.viewCtrl.dismiss(this.newCheque); }

  chkBanco(): boolean {
    if (!this.isEdit && this.bancos) {
      this.selBanco = this.bancos.find(
          (b) => { return (b.id * 1 == this.newCheque.idBanco * 1); });
      return this.selBanco != null;
    }
    return false;
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
    if (this.newCheque.FechaEmision) {
      let fi = moment(this.newCheque.FechaIngreso, FFECHA, true);
      let fe = moment(this.newCheque.FechaEmision, FFECHA, true);
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
    if (this.newCheque.FechaCobro) {
      let fi = moment(this.newCheque.FechaIngreso, FFECHA, true);
      let fe = moment(this.newCheque.FechaEmision, FFECHA, true);
      let fc = moment(this.newCheque.FechaCobro, FFECHA, true);
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
    if (this.newCheque && this.newCheque.Monto) {
      if (this.newCheque.Monto > 0) {
        return true;
      }
    }
    return false;
  }

  chkCuit(cuit: number): boolean {
    if (cuit) {
      return validaCuit(cuit.toString());
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
    this.newCheque.Firmantes.forEach((f)=>{
      res = res && this.chkCuit(f.CUIT);
    });
    return res;
  }
}
