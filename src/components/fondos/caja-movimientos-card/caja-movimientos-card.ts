import { CajaEgresoPage } from './../../../pages/fondos/caja-egreso/caja-egreso';
import { PagosProvider } from './../../../providers/pagos/pagos';
import { ClientesProvider } from './../../../providers/clientes/clientes';
import {
  ClientesAddPagoPage
} from './../../../pages/clientes/clientes-add-pago/clientes-add-pago';
import { PAGO } from './../../../models/pedidos.clases';
import { Component, Input } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import {
  CajaItem,
  Saldos,
  EGRESO
} from './../../../models/fondos.clases';
import {
  PrintMovimientoCajaPage
} from './../../../pages/documentos/print/print-movimiento-caja/print-movimiento-caja';
import { FondosProvider } from './../../../providers/fondos/fondos';

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
  constructor(public navCtrl: NavController,
    private loadCtrl: LoadingController,
    private fondosP: FondosProvider,
    private clienteP: ClientesProvider,
    private pagosP: PagosProvider) { }

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

  printList() {
    this.navCtrl.push(PrintMovimientoCajaPage, { Movimientos: this.movimientos })
  }

  ngOnInit() { this.getData(); }
  ionViewWillEnter() { this.getData(); }

  goDocumento(doc: CajaItem) {
    let load =
      this.loadCtrl.create({ content: `Buscando ${doc.tipoDocumento}...` });
    switch (doc.tipoDocumento) {
      case PAGO:
        load.present().then(() => {
          this.pagosP.getOne(doc.numeroDoc)
            .subscribe((pago) => {
              this.clienteP.getOne(pago.idCliente)
                .subscribe((cliente) => {
                  load.dismiss();
                  this.navCtrl.push(ClientesAddPagoPage,
                    { Cliente: cliente, Pago: pago });
                }, (error) => { load.dismiss(); });
            }, (error) => { load.dismiss(); });
        });
        break;
      case EGRESO:
        load.present().then(() => {
          this.fondosP.getCajaEgreso(doc.numeroDoc)
            .subscribe((data) => {
              load.dismiss();
              if (data && data.id) {
                this.navCtrl.push(CajaEgresoPage, { Egreso: data });
              }
            }, (error) => { load.dismiss(); });
        });
        break;
    }
  }

  private calSaldos(data: CajaItem[]) {
    let sE: number = 0.00;
    let sD: number = 0.00;
    let sC: number = 0.00;
    data.forEach((i) => {
      sE += Number(i.efectivo || 0) * ((i.isIngreso) ? 1 : -1);
      sD += Number(i.dolares || 0) * ((i.isIngreso) ? 1 : -1);
      sC += Number(i.cheques || 0) * ((i.isIngreso) ? 1 : -1);
      this.saldos.push({ saldoEfectivo: sE, saldoDolares: sD, saldoCheques: sC });
    });
  }
  private async getData() {
    this.fondosP.getMovimientosCaja().subscribe((data) => {
      this.movimientos = data;
      
      this.calSaldos(data);
    });
  }
}
