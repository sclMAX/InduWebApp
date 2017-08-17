import {
  COMUN_DOLAR,
  ROOT,
  LOG_ROOT,
  COMUN_DOLAR_HISTORICO
} from './../../models/db-base-paths';
import {SucursalProvider} from './../sucursal/sucursal';
import {Dolar} from './../../models/fondos.clases';
import {FECHA} from './../../models/comunes.clases';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
@Injectable()
export class DolarProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider) {
  }

  getDolarValor(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(COMUN_DOLAR)
          .subscribe((data: Dolar) => {
            if (data.valor > 0) {
              obs.next(data.valor);
            } else {
              obs.error();
            }
          }, (error) => { obs.error(error); });
    });
  }

  getDolar(): Observable<Dolar> {
    return new Observable((obs) => {
      this.db.object(COMUN_DOLAR)
          .subscribe((dolar: Dolar) => { obs.next(dolar); }, (error) => {
            obs.error(error);
            obs.complete();
          });
    });
  }

  getHistorial(realtime: boolean = true): Observable<Dolar[]> {
    return new Observable((obs) => {
      let fin = () => { (realtime) ? null : obs.complete(); };
      this.db.list(COMUN_DOLAR_HISTORICO)
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

  setDolar(valor: number): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      let dolar: Dolar = new Dolar();
      dolar.Modificador = this.sucP.genUserDoc();
      dolar.fecha = moment().format(FECHA);
      dolar.valor = Number(valor);
      dolar.id = 'Dolar';
      updData[`${COMUN_DOLAR}`] = dolar;
      let now = moment(dolar.fecha, FECHA);
      let id = `${now.year()}-${now.month()}-${now.day()}`;
      updData[`${COMUN_DOLAR_HISTORICO}${id}`] = dolar;
      let log = this.sucP.genLog(dolar);
      updData[`${LOG_ROOT}Dolar/Modificado/${log.id}`] = log;
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next('Dolar actualizado Correctamente!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`Error al actualziar le Dolar! ERROR: ${error}`);
            obs.complete();
          });
    });
  }
}
