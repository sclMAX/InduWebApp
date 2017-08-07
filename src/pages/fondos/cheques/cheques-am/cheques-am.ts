import {BancosamPage} from './../../bancos/bancosam/bancosam';
import {BancosProvider} from './../../../../providers/bancos/bancos';
import {Cheque, Banco, BancoSucursal} from './../../../../models/fondos.clases';
import {Component} from '@angular/core';
import {ViewController, NavParams, ModalController} from 'ionic-angular';
import * as moment from 'moment';

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
      this.isEdit = false;
      this.title = 'Ingresar Cheque...';
    }
  }

  private async getData() {
    this.bancosP.getAll().subscribe((bancos) => { this.bancos = bancos; });
  }

  cancelar() { this.viewCtrl.dismiss(); }

  aceptar() { this.viewCtrl.dismiss(this.newCheque); }

  chkBanco() {
    if (!this.isEdit && this.bancos) {
      this.selBanco = this.bancos.find(
          (b) => { return (b.id * 1 == this.newCheque.idBanco * 1); });
    }
  }

  chkSucursal() {
    if (!this.isEdit && this.selBanco && this.selBanco.Sucursales) {
      this.selSucursal = this.selBanco.Sucursales.find(
          (s) => { return (s.id * 1 == this.newCheque.idSucursal * 1); });
    }
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

  chkFechaEmision(): boolean {
    if (this.newCheque.FechaEmision) {
      let fi = moment(this.newCheque.FechaIngreso, 'DD/MM/YYYY',true);
      let fe = moment(this.newCheque.FechaEmision, 'DD/MM/YYYY', true);
      if (fe.isValid()) {
        let dif = fe.diff(fi);
        if(dif <= 0){
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private chkFecha(fecha: string): boolean {
    if (fecha) {
      return moment(fecha, 'DD/MM/YYYY', true).isValid();
    } else {
      return true;
    }
  }
}
