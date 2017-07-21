import {Dolar} from './../../models/fondos.clases';
import {COMUN_DOLAR} from './../../models/db-base-paths';
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
}
