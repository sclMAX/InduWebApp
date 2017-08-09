import {SUC_CONTADORES_ROOT} from './../sucursal/sucursal';
import {Contadores, COMUN_CONTADORES_ROOT} from './../../models/db-base-paths';
import {SucursalContadores} from './../../models/sucursal.clases';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class ContadoresProvider {
  constructor(private db: AngularFireDatabase) {}

  getPagosCurrentNro(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(`${SUC_CONTADORES_ROOT}`)
          .subscribe((contadores: SucursalContadores) => {
            obs.next(contadores.Pagos + 1 || 1);
          });
    });
  }

  getClientesCurrentId(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(`${COMUN_CONTADORES_ROOT}`)
          .subscribe(
              (cont: Contadores) => { obs.next(cont.Clientes + 1 || 1); });
    });
  }

  getPedidosCurrentNro(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(SUC_CONTADORES_ROOT)
          .subscribe((contadores: SucursalContadores) => {
            obs.next(contadores.Pedidos + 1 || 1);
          }, (error) => { obs.error(error); });
    });
  }
}
