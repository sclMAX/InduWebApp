import {FondosProvider} from './../fondos/fondos';
import {LogProvider} from './../log/log';
import {CtasCtesProvider} from './../ctas-ctes/ctas-ctes';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {ClientePago} from './../../models/clientes.clases';
import {ContadoresProvider} from './../contadores/contadores';
import {
  SUC_DOCUMENTOS_PAGOS_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';

@Injectable()
export class PagosProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
              private contadoresP: ContadoresProvider,
              private ctacteP: CtasCtesProvider, private logP: LogProvider,
              private fondosP: FondosProvider) {}

  add(pago: ClientePago): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      let Nro: number = Number(pago.id);
      pago.numero = Nro;
      // Set Usuario
      pago.Creador = this.sucP.genUserDoc();
      // Preparar DB Rutas
      updData[`${SUC_DOCUMENTOS_PAGOS_ROOT}${Nro}`] = pago;
      // Set Ingresp Fondos 
      this.fondosP.genIngresoPagoUpdateData(updData,pago);
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
}
