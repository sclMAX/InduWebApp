import {COMUN_FIRMANTES_ROOT} from './../../models/db-base-paths';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {ClientePago} from './../../models/clientes.clases';
import {
  CajaItem,
  Cheque,
  ChequeEntregadoPor,
  ChequeFirmante
} from './../../models/fondos.clases';
import {
  SUC_FONDOS_CHEQUES_CARTERA,
  SUC_FONDOS_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';

@Injectable()
export class FondosProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider) {
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
    this.genCajaAddIngresoUpdateData(updData, caja);
  }

  genCajaAddIngresoUpdateData(updData, item: CajaItem) {
    item.id = `${item.tipoDocumento}${item.numeroDoc}`;
    item.Creador = this.sucP.genUserDoc();
    item.isIngreso = true;
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
                   {query: {orderByChild: 'fechaCobro'}})
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

  getMovimientosCaja(): Observable<CajaItem[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_FONDOS_ROOT}Caja/`, {query: {orderByChild: 'fecha'}})
          .subscribe((snap) => { obs.next(snap || []); },
                     (error) => { obs.error(error); });
    });
  }
}
