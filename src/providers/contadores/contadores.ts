import {Contadores} from './../../models/comunes.clases';
import {SUC_CONTADORES_ROOT} from './../sucursal/sucursal';
import {COMUN_CONTADORES_ROOT} from './../../models/db-base-paths';
import {SucursalContadores} from './../../models/sucursal.clases';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class ContadoresProvider {
  constructor(private db: AngularFireDatabase) {}

  getPagosCurrentNro(realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${SUC_CONTADORES_ROOT}Pago/`)
          .on('value',
              (snap) => {
                obs.next(snap.val() + 1 || 1);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
  }

  genPagosUpdateData(updData, valor) {
    updData[`${SUC_CONTADORES_ROOT}Pago/`] = valor;
  }

  getClientesCurrentId(realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${COMUN_CONTADORES_ROOT}Cliente/`)
          .on('value',
              (snap) => {
                obs.next(snap.val() + 1 || 1);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
  }
  genClientesUpdateData(updData, valor) {
    updData[`${COMUN_CONTADORES_ROOT}Cliente/`] = valor;
  }

  getPedidosCurrentNro(tipo: string = 'Pedido',
                       realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${SUC_CONTADORES_ROOT}${tipo}/`)
          .on('value',
              (snap) => {
                obs.next(snap.val() + 1 || 1);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
  }

  genPedidosUpdateData(updData, valor, tipo) {
    updData[`${SUC_CONTADORES_ROOT}${tipo}/`] = valor;
  }

  getStockIngresoCurrentNro(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(SUC_CONTADORES_ROOT)
          .subscribe((contadores: SucursalContadores) => {
            obs.next(contadores.DocStockIngreso * 1 + 1 || 1);
          }, (error) => { obs.error(error); });
    });
  }
}
