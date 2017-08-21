import {Component, Input} from '@angular/core';
import {NavController} from 'ionic-angular';

import {CajaItem, Saldos} from './../../../models/fondos.clases';
import {PrintMovimientoCajaPage} from './../../../pages/documentos/print/print-movimiento-caja/print-movimiento-caja';
import {FondosProvider} from './../../../providers/fondos/fondos';

@Component({
  selector: 'caja-movimientos-card',
  templateUrl: 'caja-movimientos-card.html'
})
export class CajaMovimientosCardComponent {
  @Input() title: string = 'Movimientos de Caja';
  @Input() color: string = 'scroll-content';
  @Input() headerColor: string = 'movimientosCajaHeader';
  @Input() toolBarColor: string = 'subToolBar';
  @Input() itemColor: string = 'light';
  @Input() itemImparColor: string;
  @Input() showList: boolean = false;

  movimientos: CajaItem[] = [];
  saldos: Saldos[] = [];
  constructor(public navCtrl: NavController, private fondosP: FondosProvider) {}

  calTotal(): number {
    let total: number = 0.00;
    return total;
  }

  getColor(item, par): string {
    let color: string = 'light';
    color = (!par && this.itemImparColor) ? (this.itemImparColor) :
                                            (this.itemColor);
    return color;
  }

  printList(){this.navCtrl.push(
      PrintMovimientoCajaPage, {Movimientos: this.movimientos})}

  ngOnInit() {
    this.getData();
  }
  ionViewWillEnter() {
    this.getData();
  }

  private calSaldos(data: CajaItem[]) {
    let sE: number = 0.00;
    let sD: number = 0.00;
    let sC: number = 0.00;
    data.forEach((i) => {
      sE += (i.isIngreso) ? (i.efectivo * 1) : (i.efectivo * -1);
      sD += (i.isIngreso) ? (i.dolares * 1) : (i.dolares * -1);
      sC += (i.isIngreso) ? (i.cheques * 1) : (i.cheques * -1);
      this.saldos.push({saldoEfectivo: sE, saldoDolares: sD, saldoCheques: sC});
    });
  }
  private async getData() {
    this.fondosP.getMovimientosCaja().subscribe((data) => {
      this.movimientos = data;
      this.calSaldos(data);
    });
  }
}