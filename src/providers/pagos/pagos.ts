import {
  SUC_DOCUMENTOS_PAGOS_ROOT,
  SUC_FONDOS_CHEQUES_CARTERA,
  SUC_CONTADORES_ROOT,
  SUC_DOCUMENTOS_CTASCTES_ROOT,
  SUC_LOG_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {ClientePago, CtaCte} from './../../models/clientes.clases';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class PagosProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider) {
  }

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
            `${cheque.Cheque.idBanco}-${cheque.Cheque.idSucursal}-${cheque.Cheque.Numero}`;
        cheque.Cheque.Creador = this.sucP.genUserDoc();
        updData[`${SUC_FONDOS_CHEQUES_CARTERA}${cheque.Cheque.id}/`] =
            cheque.Cheque;
      });
      // Cta Cte
      let cta = new CtaCte();
      cta.TipoDocumento = 'Pago';
      cta.Creador = this.sucP.genUserDoc();
      cta.Numero = Nro;
      cta.Fecha = pago.Fecha;
      cta.Debe = 0.00;
      cta.Haber = pago.TotalUs;
      cta.Saldo = cta.Debe - cta.Haber;
      cta.id = `${cta.TipoDocumento}${cta.Numero}`;
      updData[`${SUC_DOCUMENTOS_CTASCTES_ROOT}${pago.idCliente}/${cta.id}/`] =
          cta;
      // Contador
      updData[`${SUC_CONTADORES_ROOT}Pagos/`] = Nro;
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
