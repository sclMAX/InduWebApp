import {Dolar} from './../../models/fondos.clases';
import {COMUN_DOLAR, ROOT} from './../../models/db-base-paths';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class DolarProvider {
  constructor(private db: AngularFireDatabase) {}

  public getDolarValor(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(COMUN_DOLAR)
          .subscribe((data: Dolar) => {
            if (data.Valor > 0) {
              obs.next(data.Valor);
            } else {
              obs.error();
            }
          }, (error) => { obs.error(error); });
    });
  }

  public setDolar(valor: number): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      updData[`${COMUN_DOLAR}`] = {
        Fecha: new Date().toISOString(),
        Valor: valor,
        id: 'Dolar'
      };
      let hoy = new Date();
      let n = `${hoy.getFullYear()}${hoy.getMonth()}${hoy.getDate()}`;
      updData[`${ROOT}Comun/DolarHistorico/${n}`] = {
        id: n,
        Fecha: new Date().toISOString(),
        Valor: valor
      };
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
