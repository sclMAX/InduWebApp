import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {ClientePago, CtaCte} from './../../models/clientes.clases';
import {ContadoresProvider} from './../contadores/contadores';
import {SUC_DOCUMENTOS_CTASCTES_ROOT, SUC_DOCUMENTOS_PAGOS_ROOT, SUC_FONDOS_CHEQUES_CARTERA, SUC_LOG_ROOT, SucursalProvider} from './../sucursal/sucursal';

@Injectable()
export class PagosProvider {
  constructor(
      private db: AngularFireDatabase, private sucP: SucursalProvider,
      private contadoresP: ContadoresProvider) {}

  add(pago: ClientePago): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      let Nro: number = pago.id;
      // Set Usuario
      pago.Creador = this.sucP.genUserDoc();
      // Preparar DB Rutas
      updData[`${SUC_DOCUMENTOS_PAGOS_ROOT}${Nro}`] = pago;
      // Cheques
      pago.Cheques.forEach((cheque) => {
        cheque.Cheque.id =
            `${cheque.Cheque.idBanco}-${cheque.Cheque.idSucursal
            }-${cheque.Cheque.numero}`;
        cheque.Cheque.Creador = this.sucP.genUserDoc();
        updData[`${SUC_FONDOS_CHEQUES_CARTERA}${cheque.Cheque.id}/`] =
            cheque.Cheque;
      });
      // Cta Cte
      let cta = new CtaCte();
      cta.tipoDocumento = 'Pago';
      cta.Creador = this.sucP.genUserDoc();
      cta.numero = Nro;
      cta.fecha = pago.fecha;
      cta.debe = 0.00;
      cta.haber = pago.totalFinalUs;
      cta.saldo = cta.debe - cta.haber;
      cta.id = `${cta.tipoDocumento}${cta.numero}`;
      updData[`${SUC_DOCUMENTOS_CTASCTES_ROOT}${pago.idCliente}/${cta.id}/`] =
          cta;
      // Contador
      this.contadoresP.genPagosUpdateData(updData, Nro);
      // Log
      let log = this.sucP.genLog(pago);
      updData[`${SUC_LOG_ROOT}Pagos/Creados/${log.id}`] = log;
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next('Pago guardado correctamente!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se guardo el Pago! Error:${error}`);
            obs.complete();
          });
    });
  }
}
