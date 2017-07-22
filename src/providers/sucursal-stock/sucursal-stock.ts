import {SUC_STOCK_ROOT} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class SucursalStockProvider {
  constructor(private db: AngularFireDatabase){};

  public getStock(idPerfil: string, idColor: string): Observable<number> {
    return new Observable((obs) => {
      if ((idPerfil && idPerfil.trim() != '') &&
          (idColor && idColor.trim() != '')) {
        this.db.database.ref(`${SUC_STOCK_ROOT}${idPerfil}/${idColor}/Stock`)
            .once('value')
            .then((stock) => {
              obs.next(stock.val() || 0);
              obs.complete();
            })
            .catch((error) => {
              obs.error(error);
              obs.complete();
            });
      } else {
        obs.error('ERROR:Perfil y/o Color no proporsionados!');
        obs.complete();
      }
    });
  }

  public getStockDisponible(idPerfil: string,
                            idColor: string): Observable<number> {
    return new Observable((obs) => {
      if ((idPerfil && idPerfil.trim() != '') &&
          (idColor && idColor.trim() != '')) {
        this.db.database
            .ref(`${SUC_STOCK_ROOT}${idPerfil}/${idColor}/Disponible`)
            .once('value')
            .then((stock) => {
              obs.next(stock.val() || 0);
              obs.complete();
            })
            .catch((error) => {
              obs.error(error);
              obs.complete();
            });
      } else {
        obs.error('ERROR:Perfil y/o Color no proporsionados!');
        obs.complete();
      }
    });
  }

  public setStockDisponible(idPerfil: string, idColor: string,
                            unidades: number): Observable<number> {
    return new Observable((obs) => {
      this.getStockDisponible(idPerfil, idColor)
          .subscribe(
              (oldVal) => {
                let newVal: number = (oldVal * 1) + (unidades * 1);
                this.updateStockDisponible(idPerfil, idColor, newVal)
                    .subscribe(
                        (ok) => {
                          if (ok) {
                            obs.next(newVal);
                          } else {
                            obs.error(`ERROR: Res:${ok}, newVal:${newVal}`);
                          }
                          obs.complete();
                        },
                        (error) => {
                          obs.error(error);
                          obs.complete();
                        });
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }

  private updateStockDisponible(idPerfil: string, idColor: string,
                                valor: number): Observable<boolean> {
    return new Observable(
        (obs) => {this.db.database
                      .ref(`${SUC_STOCK_ROOT}${idPerfil}/${idColor}/Disponible`)
                      .set(valor)
                      .then((ok) => {
                        obs.next(true);
                        obs.complete();
                      })
                      .catch((error) => {
                        obs.error(error);
                        obs.complete();
                      })});
  }
}
