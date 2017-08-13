import {Banco, BancoSucursal} from './../../../../models/fondos.clases';
import {Component} from '@angular/core';
import {ViewController, NavParams} from 'ionic-angular';


@Component({
  selector: 'page-bancos-sucursal-am',
  templateUrl: 'bancos-sucursal-am.html',
})
export class BancosSucursalAmPage {
  title:string;
  banco: Banco;
  newSucursal: BancoSucursal;
  oldSucursal: BancoSucursal;
  isEdit: boolean = false;
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.banco = this.navParams.get('Banco');
    this.oldSucursal = this.navParams.get('Sucursal');
    if (!this.banco) {
      this.viewCtrl.dismiss();
    }
    if (this.oldSucursal) {
      this.newSucursal = JSON.parse(JSON.stringify(this.oldSucursal));
      this.isEdit = true;
      this.title = `Editando Suc. ${this.newSucursal.nombre}...`;
    } else {
      if(!this.banco.Sucursales){this.banco.Sucursales = [];}
      this.newSucursal = new BancoSucursal();
      this.isEdit = false;
      this.title = `Agregar Suc. a ${this.banco.nombre}`;
    }
  }

  chkId():boolean { return this.isUnique(this.newSucursal); }

  guardar() {
    if (!this.isEdit) {
      this.banco.Sucursales.push(this.newSucursal);
    } else {
      let idx: number = this.banco.Sucursales.findIndex(
          (s) => { return (s.id === this.newSucursal.id); });
      if (idx > -1) {
        this.banco.Sucursales[idx] = this.newSucursal;
      }
    }
    this.viewCtrl.dismiss(this.banco);
  }

  cancelar() { this.viewCtrl.dismiss(); }

  isValid(form): boolean { return form.valid; }

  private isUnique(newSuc: BancoSucursal): boolean {
    if (this.isEdit) {
      return true;
    }
    if (this.banco && this.banco.Sucursales) {
      let suc: BancoSucursal =
          this.banco.Sucursales.find((s) => { return ((s.id * 1 == newSuc.id * 1)); });
      if (suc) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
}
