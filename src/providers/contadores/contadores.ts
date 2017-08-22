import {SUC_CONTADORES_ROOT} from './../sucursal/sucursal';
import {COMUN_CONTADORES_ROOT} from './../../models/db-base-paths';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class ContadoresProvider {
  constructor(private db: AngularFireDatabase) {}

  getPagosCurrentNro(realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${SUC_CONTADORES_ROOT}pago/`)
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
    updData[`${SUC_CONTADORES_ROOT}pago/`] = valor;
  }

  getClientesCurrentId(realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${COMUN_CONTADORES_ROOT}cliente/`)
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
    updData[`${COMUN_CONTADORES_ROOT}cliente/`] = valor;
  }

  getPedidosCurrentNro(tipo: string,
                       realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${SUC_CONTADORES_ROOT}${tipo.toLowerCase()}/`)
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

  genPedidosUpdateData(updData, valor, tipo: string) {
    updData[`${SUC_CONTADORES_ROOT}${tipo.toLowerCase()}/`] = valor;
  }

  getStockIngresoCurrentNro(realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${SUC_CONTADORES_ROOT}stockIngreso/`)
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

  genStockIngresoUpdateData(updData, valor: number) {
    updData[`${SUC_CONTADORES_ROOT}stockIngreso/`] = valor;
  }

  getCajaEgresoCurrentNro(realtime: boolean = true): Observable<number> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.database.ref(`${SUC_CONTADORES_ROOT}cajaEgreso/`)
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

  genCajaEgresoUpdateData(updData, valor: number) {
    updData[`${SUC_CONTADORES_ROOT}cajaEgreso/`] = valor;
  }
}
