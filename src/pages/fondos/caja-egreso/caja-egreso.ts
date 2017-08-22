import {ContadoresProvider} from './../../../providers/contadores/contadores';
import {CajaEgreso} from './../../../models/fondos.clases';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-caja-egreso',
  templateUrl: 'caja-egreso.html',
})
export class CajaEgresoPage {
  title: string;
  egreso: CajaEgreso;
  isReadOnly: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private contadoresP: ContadoresProvider) {
    this.egreso = this.navParams.get('Egreso');
    if (this.egreso) {
      this.isReadOnly = true;
      this.title = `Egreso Nro: ${this.egreso.id}`;
    } else {
      this.egreso = new CajaEgreso();
      this.getData();
      this.title = 'Nuevo Egreso de Caja';
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

  addCheque() {}

  removeCheque(idx) { this.egreso.Cheques.splice(idx, 1); }

  goBack() { this.navCtrl.pop(); }

  isValid(form): boolean {
    let res: boolean = false;
    res = form.valid;
    res = res && ((this.calTotal() > 0) || (Number(this.egreso.dolares) > 0));
    return res;
  }

  private async getData() {
    this.contadoresP.getCajaEgresoCurrentNro().subscribe(
        (data) => { this.egreso.id = data; });
  }
}
