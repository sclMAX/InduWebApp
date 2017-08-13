import {SUC_DESCUENTOS_ROOT} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class DescuentosProvider {
  private descuentos: DescuentosGlobales;
  constructor(private db: AngularFireDatabase) {}

  getDescuentos(): Observable<DescuentosGlobales> {
    return new Observable((obs) => {
      if (this.descuentos) {
        obs.next(this.descuentos);
        obs.complete();
      } else {
        this.db.object(SUC_DESCUENTOS_ROOT)
                      .subscribe(
                          (ok: DescuentosGlobales) => {
                            this.descuentos = ok;
                            obs.next(this.descuentos);
                            obs.complete();
                          },
                          (error) => {
                            obs.error(error);
                            obs.complete();
                          });
      }
    });
  }
}

export class DescuentosGlobales { Kilos: DescuentoKilos[] = []; }

export class DescuentoKilos {
  minimoUnidades: number = 0;
  descuento: number = 0.00;
}