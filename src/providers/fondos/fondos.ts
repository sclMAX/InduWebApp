import { ContadoresProvider } from './../contadores/contadores';
import { FECHA } from './../../models/comunes.clases';
import { COMUN_FIRMANTES_ROOT } from './../../models/db-base-paths';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { ClientePago } from './../../models/clientes.clases';
import {
  CajaItem,
  Cheque,
  ChequeEntregadoPor,
  ChequeFirmante,
  CajaEgreso,
  ChequeEntregadoA,
  EGRESO,
  CajaMovimiento,
  INGRESO
} from './../../models/fondos.clases';
import {
  SUC_FONDOS_CHEQUES_CARTERA,
  SUC_FONDOS_ROOT,
  SucursalProvider,
  SUC_FONDOS_CHEQUES_ROOT,
  SUC_DOCUMENTOS_ROOT
} from './../sucursal/sucursal';

@Injectable()
export class FondosProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
    private contadoresP: ContadoresProvider) { }

  addCajaEgreso(egreso: CajaEgreso): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      let totalCheques: number = 0.00;
      let nro: number = egreso.id;
      // Set Creador
      egreso.Creador = this.sucP.genUserDoc();
      // Si hay Cheques, Actualizar calcular total
      if (egreso.Cheques) {
        egreso.Cheques.forEach((c) => {
          if (!c.EntregadoA) {
            c.EntregadoA = new ChequeEntregadoA();
          }
          c.EntregadoA.fecha = moment().format(FECHA);
          c.EntregadoA.nombre = egreso.tipo;
          totalCheques += Number(c.monto || 0);
          this.genMoveChequesUpdateData(updData, 'Cartera', 'Entregados', c);
        });
      }
      // Generar Item Caja
      let caja: CajaItem = new CajaItem();
      caja.tipoDocumento = EGRESO;
      caja.numeroDoc = nro;
      caja.efectivo = Number(egreso.efectivo);
      caja.dolares = Number(egreso.dolares);
      caja.cheques = Number(totalCheques);
      caja.isIngreso = false;
      // Generar Caja UpdateData
      this.genCajaAddIngresoUpdateData(updData, caja);
      // Generar Egreso UpdateData
      updData[`${SUC_DOCUMENTOS_ROOT}${EGRESO}/${nro}/`] = egreso;
      // Update Contador
      this.contadoresP.genCajaEgresoUpdateData(updData, nro);
      // Ejecutar peticion
      this.db.database.ref()
        .update(updData)
        .then(() => {
          obs.next('Caja Actualziada Correctamente!');
          obs.complete();
        })
        .catch((error) => {
          obs.error(`Actualizar la Caja...! Error:${error}`);
          obs.complete();
        });

    });
  }

  addCajaIngreso(ingreso: CajaEgreso, refDolar: number): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      let totalCheques: number = 0.00;
      let nro: number = ingreso.id;
      // Set Creador
      ingreso.Creador = this.sucP.genUserDoc();
      // Si hay Cheques, Actualizar calcular total
      if (ingreso.Cheques) {
        ingreso.Cheques.forEach(
          (c) => { totalCheques += Number(c.monto || 0); c.refDolar = refDolar; });
        //Add Cheques a Cartera
        this.genChequesCarteraAdd(updData, ingreso.Cheques)
      }
      // Generar Item Caja
      let caja: CajaItem = new CajaItem();
      caja.tipoDocumento = INGRESO;
      caja.numeroDoc = nro;
      caja.efectivo = Number(ingreso.efectivo);
      caja.dolares = Number(ingreso.dolares);
      caja.cheques = Number(totalCheques);
      caja.isIngreso = true;
      // Generar Caja UpdateData
      this.genCajaAddIngresoUpdateData(updData, caja);
      // Generar Ingreso UpdateData
      updData[`${SUC_DOCUMENTOS_ROOT}${INGRESO}/${nro}/`] = ingreso;
      // Update Contador
      this.contadoresP.genCajaEgresoUpdateData(updData, nro);
      // Ejecutar peticion
      this.db.database.ref()
        .update(updData)
        .then(() => {
          obs.next('Caja Actualziada Correctamente!');
          obs.complete();
        })
        .catch((error) => {
          obs.error(`Actualizar la Caja...! Error:${error}`);
          obs.complete();
        });

    });
  }

  getCajaEgreso(id: number): Observable<CajaEgreso> {
    return new Observable((obs) => {
      this.db.database.ref(`${SUC_DOCUMENTOS_ROOT}${EGRESO}/${id}/`)
        .once('value',
        (snap) => {
          obs.next(snap.val() || null);
          obs.complete();
        },
        (error) => {
          obs.error(error);
          obs.complete();
        });
    });
  }

  getCajaIngreso(id: number): Observable<CajaEgreso> {
    return new Observable((obs) => {
      this.db.database.ref(`${SUC_DOCUMENTOS_ROOT}${INGRESO}/${id}/`)
        .once('value',
        (snap) => {
          obs.next(snap.val() || null);
          obs.complete();
        },
        (error) => {
          obs.error(error);
          obs.complete();
        });
    });
  }

  genMoveChequesUpdateData(updData, de: string, a: string, cheque: Cheque) {
    // Eliminar Cheque en Origen;
    updData[`${SUC_FONDOS_CHEQUES_ROOT}${de}/${cheque.id}/`] = {};
    // Add Cheque a Destino
    updData[`${SUC_FONDOS_CHEQUES_ROOT}${a}/${cheque.id}/`] = cheque;
  }

  genIngresoPagoUpdateData(updData, pago: ClientePago) {
    let totalCheques: number = 0.00;
    let cheques: Cheque[] = [];
    pago.Cheques.forEach((cheque) => {
      // Set EntregadoPor
      cheque.Cheque.EntregadoPor = new ChequeEntregadoPor();
      cheque.Cheque.EntregadoPor.idCliente = pago.idCliente;
      cheque.Cheque.EntregadoPor.sucursal = this.sucP.getUsuario().sucursal;
      cheque.Cheque.refDolar = cheque.Dolar.valor;
      cheques.push(cheque.Cheque);
      // Calcular monto acumulado de cheques
      totalCheques += Number(cheque.Cheque.monto);
    });
    // Ingresar Cheques a Cartera
    this.genChequesCarteraAdd(updData, cheques);
    // Generar Item Caja
    let caja: CajaItem = new CajaItem();
    caja.tipoDocumento = pago.tipo;
    caja.numeroDoc = pago.numero;
    caja.efectivo = Number(pago.efectivo);
    caja.dolares = Number(pago.dolares);
    caja.cheques = Number(totalCheques);
    caja.isIngreso = true;
    this.genCajaAddIngresoUpdateData(updData, caja);
  }

  genChequesCarteraAdd(updData, cheques: Cheque[]) {
    cheques.forEach((cheque) => {
      // Set Id
      cheque.id = `${cheque.idBanco
        }-${cheque.idSucursal}-${cheque.numero}`;
      // Set Creador
      cheque.Creador = this.sucP.genUserDoc();
      // Crear Firmantes UpdateData
      cheque.Firmantes.forEach((f) => {
        this.genFirmanteUpdateData(updData,
          new ChequeFirmante(f.CUIT, f.nombre));
      });
      // Crear Cheque UpdateData
      updData[`${SUC_FONDOS_CHEQUES_CARTERA}${cheque.id}/`] = cheque;
    });
  }

  genCajaAddIngresoUpdateData(updData, item: CajaItem) {
    item.id = `${item.tipoDocumento}${item.numeroDoc}`;
    item.Creador = this.sucP.genUserDoc();
    updData[`${SUC_FONDOS_ROOT}Caja/${item.id}`] = item;
  }

  genFirmanteUpdateData(updData, firmante: ChequeFirmante) {
    updData[`${COMUN_FIRMANTES_ROOT}${firmante.CUIT}/`] = firmante;
  }

  getFirmante(cuit: number): Observable<ChequeFirmante> {
    return new Observable((obs) => {
      this.db.database.ref(`${COMUN_FIRMANTES_ROOT}${cuit}/`)
        .once('value',
        (snap) => {
          obs.next(snap.val() || null);
          obs.complete();
        },
        (error) => {
          obs.error(error);
          obs.complete();
        });
    });
  }

  getChequesEnCartera(realtime: boolean = true): Observable<Cheque[]> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.list(SUC_FONDOS_CHEQUES_CARTERA,
        { query: { orderByChild: 'fechaCobro' } })
        .subscribe(
        (snap: Cheque[]) => {
          obs.next(snap || []);
          fin();
        },
        (error) => {
          obs.error(error);
          fin();
        });
    });
  }

  getChequesEntregados(realtime: boolean = true): Observable<Cheque[]> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.list(`${SUC_FONDOS_CHEQUES_ROOT}Entregados/`,
        { query: { orderByChild: 'fechaCobro' } })
        .subscribe(
        (snap) => {
          obs.next(snap || []);
          fin();
        },
        (error) => {
          obs.error(error);
          fin();
        });
    });
  }

  getMovimientosCaja(fecha1?, fecha2?): Observable<CajaMovimiento[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_FONDOS_ROOT}Caja/`, { query: { orderByChild: 'id' } })
        .subscribe((snap) => {
          let m: CajaMovimiento[] = snap || [];
          // Ordenar
          m = m.sort((a, b) => { return a.numeroDoc - b.numeroDoc; });
          m = m.sort((a, b) => {
            return moment(a.fecha, FECHA)
              .diff(moment(b.fecha, FECHA), 'days');
          });
          // Calcular saldos
          let sE: number = 0.00;
          let sD: number = 0.00;
          let sC: number = 0.00;
          m.forEach((i) => {
            sE += Number(i.efectivo || 0) * ((i.isIngreso) ? 1 : -1);
            i.saldoEfectivo = sE;
            sD += Number(i.dolares || 0) * ((i.isIngreso) ? 1 : -1);
            i.saldoDolares = sD;
            sC += Number(i.cheques || 0) * ((i.isIngreso) ? 1 : -1);
            i.saldoCheques = sC;
          });
          // Filtrar
          if (fecha1 && fecha2) {
            m = m.filter((i) => {
              return (moment(i.fecha, FECHA)
                .diff(moment(fecha1, FECHA), 'days') >= 0) &&
                (moment(i.fecha, FECHA)
                  .diff(moment(fecha2, FECHA), 'days') <= 0);
            });
          }
          obs.next(m);
        }, (error) => { obs.error(error); });

    });
  }

  getSaldosEfectivo():
    Observable<{ saldoEfectivo: number, saldoDolares: number }> {
    return new Observable((obs) => {
      this.getMovimientosCaja().subscribe((data) => {
        let saldoEfectivo: number = 0.00;
        let saldoDolares: number = 0.00;
        data.forEach((i) => {
          saldoEfectivo += (Number(i.efectivo || 0) * ((i.isIngreso) ? 1 : -1));
          saldoDolares += (Number(i.dolares || 0) * ((i.isIngreso) ? 1 : -1));
        });
        obs.next({ saldoEfectivo, saldoDolares });
      }, (error) => { obs.error(error); });
    });
  }
}
