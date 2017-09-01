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
  EGRESO
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

  genMoveChequesUpdateData(updData, de: string, a: string, cheque: Cheque) {
    // Eliminar Cheque en Origen;
    updData[`${SUC_FONDOS_CHEQUES_ROOT}${de}/${cheque.id}/`] = {};
    // Add Cheque a Destino
    updData[`${SUC_FONDOS_CHEQUES_ROOT}${a}/${cheque.id}/`] = cheque;
  }

  genIngresoPagoUpdateData(updData, pago: ClientePago) {
    let totalCheques: number = 0.00;
    // Ingresar Cheques a Cartera
    pago.Cheques.forEach((cheque) => {
      // Set Id
      cheque.Cheque.id = `${cheque.Cheque.idBanco
        }-${cheque.Cheque.idSucursal}-${cheque.Cheque.numero}`;
      // Set Creador
      cheque.Cheque.Creador = this.sucP.genUserDoc();
      // Set EntregadoPor
      cheque.Cheque.EntregadoPor = new ChequeEntregadoPor();
      cheque.Cheque.EntregadoPor.idCliente = pago.idCliente;
      cheque.Cheque.EntregadoPor.sucursal = this.sucP.getUsuario().sucursal;
      // Crear Firmantes UpdateData
      cheque.Cheque.Firmantes.forEach((f) => {
        this.genFirmanteUpdateData(updData,
          new ChequeFirmante(f.CUIT, f.nombre));
      });
      // Crear Cheque UpdateData
      updData[`${SUC_FONDOS_CHEQUES_CARTERA}${cheque.Cheque.id}/`] =
        cheque.Cheque;
      // Calcular monto acumulado de cheques
      totalCheques += Number(cheque.Cheque.monto);
    });
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

  getMovimientosCaja(): Observable<CajaItem[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_FONDOS_ROOT}Caja/`, { query: { orderByChild: 'fecha' } })
        .subscribe((snap) => {
          let m: CajaItem[] = snap || [];
          m = m.sort((a, b) => {
            return moment(a.fecha, FECHA).diff(moment(b.fecha, FECHA), 'days');
          });
          obs.next(m);
        },
        (error) => { obs.error(error); });

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
