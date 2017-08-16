import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {ClientePago} from './../../models/clientes.clases';
import {ContadoresProvider} from './../contadores/contadores';
import {CtasCtesProvider} from './../ctas-ctes/ctas-ctes';
import {LogProvider} from './../log/log';
import {SUC_DOCUMENTOS_PAGOS_ROOT, SUC_FONDOS_CHEQUES_CARTERA, SucursalProvider} from './../sucursal/sucursal';

@Injectable()
export class PagosProvider {
  constructor(
      private db: AngularFireDatabase, private sucP: SucursalProvider,
      private contadoresP: ContadoresProvider,
      private ctacteP: CtasCtesProvider, private logP: LogProvider) {}

  add(pago: ClientePago): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      let Nro: number = pago.id;
      pago.numero = pago.id;
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
      this.ctacteP.genDocUpdateData(updData, pago, false);
      // Contador
      this.contadoresP.genPagosUpdateData(updData, Nro);
      // Log
      this.logP.genPagoUpdateData(updData, pago, 'Creado');
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

  getOne(idPago: number): Observable<ClientePago> {
    return new Observable((obs) => {
      this.db.database.ref(`${SUC_DOCUMENTOS_PAGOS_ROOT}${idPago}/`)
          .once(
              'value',
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
}
