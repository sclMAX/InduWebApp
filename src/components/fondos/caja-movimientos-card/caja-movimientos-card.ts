import {Observable} from 'rxjs/Observable';
import {CajaEgresoPage} from './../../../pages/fondos/caja-egreso/caja-egreso';
import {PagosProvider} from './../../../providers/pagos/pagos';
import {ClientesProvider} from './../../../providers/clientes/clientes';
import {
  ClientesAddPagoPage
} from './../../../pages/clientes/clientes-add-pago/clientes-add-pago';
import {PAGO} from './../../../models/pedidos.clases';
import {Component, Input} from '@angular/core';
import {NavController, LoadingController} from 'ionic-angular';

import {
  CajaItem,
  EGRESO,
  CajaMovimiento,
  INGRESO
} from './../../../models/fondos.clases';
import {FondosProvider} from './../../../providers/fondos/fondos';
import {printCajaMovimientos} from './../../../print/print-fondos';
import {FECHA} from '../../../models/comunes.clases';
import * as moment from 'moment';
import { numFormat } from "../../../print/config-comun";

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
  fecha1: string = moment().subtract(1, 'weeks').format(FECHA);
  fecha2: string = moment().format(FECHA);
  isFilter: boolean = false;

  movimientos: CajaMovimiento[] = [];
  descripciones: Array<{id: string, descripcion: Observable<string>}> = [];
  totalEgresos: {efectivo: number, dolares: number, cheques: number};
  totalIngresos: {efectivo: number, dolares: number, cheques: number};
  constructor(public navCtrl: NavController,
              private loadCtrl: LoadingController,
              private fondosP: FondosProvider,
              private clienteP: ClientesProvider,
              private pagosP: PagosProvider) {}

  getColor(item, par): string {
    let color: string = 'light';
    color = (!par && this.itemImparColor) ? (this.itemImparColor) :
                                            (this.itemColor);
    return color;
  }

  getSaldoEfectivo(): number {
    let s: number = 0.00;
    if (this.movimientos && this.movimientos.length > 0) {
      s = Number(this.movimientos[this.movimientos.length - 1].saldoEfectivo);
    }
    return s;
  }
  getSaldoCheques(): number {
    let s: number = 0.00;
    if (this.movimientos && this.movimientos.length > 0) {
      s = Number(this.movimientos[this.movimientos.length - 1].saldoCheques);
    }
    return s;
  }
  getSaldoDolares(): number {
    let s: number = 0.00;
    if (this.movimientos && this.movimientos.length > 0) {
      s = Number(this.movimientos[this.movimientos.length - 1].saldoDolares);
    }
    return s;
  }
  printList() {
    printCajaMovimientos(this.movimientos, this.totalIngresos,
                         this.totalEgresos);
  }

  ngOnInit() { this.filtrar(); }
  ionViewWillEnter() { this.filtrar(); }

  goDocumento(doc: CajaItem) {
    let load =
        this.loadCtrl.create({content: `Buscando ${doc.tipoDocumento}...`});
    switch (doc.tipoDocumento) {
      case PAGO:
        load.present().then(() => {
          this.pagosP.getOne(doc.numeroDoc)
              .subscribe((pago) => {
                this.clienteP.getOne(pago.idCliente)
                    .subscribe((cliente) => {
                      load.dismiss();
                      this.navCtrl.push(ClientesAddPagoPage,
                                        {Cliente: cliente, Pago: pago});
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
                  this.navCtrl.push(CajaEgresoPage,
                                    {Egreso: data, isEgreso: true});
                }
              }, (error) => { load.dismiss(); });
        });
        break;
      case INGRESO:
        load.present().then(() => {
          this.fondosP.getCajaIngreso(doc.numeroDoc)
              .subscribe((data) => {
                load.dismiss();
                if (data && data.id) {
                  this.navCtrl.push(CajaEgresoPage,
                                    {Egreso: data, isEgreso: false});
                }
              }, (error) => { load.dismiss(); });
        });
        break;
    }
  }

  calTotales() {
    let e = {efectivo: 0.00, dolares: 0.00, cheques: 0.00};
    let i = {efectivo: 0.00, dolares: 0.00, cheques: 0.00};
    if (this.movimientos) {
      this.movimientos.forEach((m) => {
        if (!m.isIngreso) {
          e.cheques += Number(m.cheques);
          e.dolares += Number(m.dolares);
          e.efectivo += Number(m.efectivo);
        } else {
          i.cheques += Number(m.cheques);
          i.dolares += Number(m.dolares);
          i.efectivo += Number(m.efectivo);
        }
      });
    }
    this.totalEgresos = e;
    this.totalIngresos = i;
  }

  getDescripcion(item: CajaMovimiento): Observable<string> {
    if (item) {
      let d = this.descripciones.find(i => i.id == item.id);
      if (d) {
        return d.descripcion;
      } else {
        if (item.isIngreso) {
          if(item.tipoDocumento == PAGO){
            this.descripciones.push({
              id: item.id,
              descripcion: this.pagosP.getOne(item.numeroDoc).map(data=>{return `PAGO CLIENTE: ${numFormat(data.idCliente,'3.0-0')}`; })
            });
          }else{
          this.descripciones.push({
            id: item.id,
            descripcion: new Observable(obs => obs.next('INGRESO NC'))
          });
        }
        } else {
          this.descripciones.push({
            id: item.id,
            descripcion: this.fondosP.getCajaEgreso(item.numeroDoc)
                             .map(data => data.tipo)
          });
        }
      }
    }
  }

  filtrar() {
    if (this.fecha1 && this.fecha2 && !this.isFilter) {
      this.isFilter = true;
      this.getData(this.fecha1, this.fecha2);
    } else {
      this.isFilter = false;
      this.fecha1 = '';
      this.fecha2 = moment().format(FECHA);
      this.getData();
    }
  }

  private async getData(f1?, f2?) {
    this.fondosP.getMovimientosCaja(f1, f2).subscribe((data) => {
      this.movimientos = data;
      this.calTotales();
    });
  }
}
