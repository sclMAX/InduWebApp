import {SucursalProvider} from './../sucursal/sucursal';
import {
  BANCOS_ROOT,
  LOG_BANCOS_CREADOS,
  LOG_BANCOS_MODIFICADOS
} from './../../models/db-base-paths';
import {Observable} from 'rxjs/Observable';
import {Banco} from './../../models/fondos.clases';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class BancosProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider) {
  }

  add(banco: Banco): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(banco, true)
          .subscribe(
              (isUnique) => {
                if (isUnique) {
                  banco.Creador = this.sucP.genUserDoc();
                  let updData = {};
                  updData[`${BANCOS_ROOT}${banco.id}/`] = banco;
                  let log = this.sucP.genLog(banco);
                  updData[`${LOG_BANCOS_CREADOS}${log.id}/`] = log;
                  this.db.database.ref()
                      .update(updData)
                      .then(() => {
                        obs.next(
                            `Se guardo correctamente el Banco ${banco.Nombre}`);
                        obs.complete();
                      })
                      .catch((error) => {
                        obs.error(
                            `No se pudo guardar el Banco ${banco.Nombre}!... Error: ${error}`);
                        obs.complete();
                      });
                } else {
                  obs.error(
                      `Ya existe el Banco Nro:${banco.id} y/o ${banco.Nombre}!`);
                  obs.complete();
                }
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }

  update(banco: Banco): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(banco, false)
          .subscribe(
              (isUnique) => {
                if (isUnique) {
                  banco.Modificador = this.sucP.genUserDoc();
                  let updData = {};
                  updData[`${BANCOS_ROOT}${banco.id}/`] = banco;
                  let log = this.sucP.genLog(banco);
                  updData[`${LOG_BANCOS_MODIFICADOS}${log.id}/`] = log;
                  this.db.database.ref()
                      .update(updData)
                      .then(() => {
                        obs.next(
                            `Se guardo correctamente el Banco ${banco.Nombre}`);
                        obs.complete();
                      })
                      .catch((error) => {
                        obs.error(
                            `No se pudo guardar el Banco ${banco.Nombre}!... Error: ${error}`);
                        obs.complete();
                      });
                } else {
                  obs.error(
                      `No se puede guardar! Ya existe un Banco ${banco.Nombre}!`);
                  obs.complete();
                }
              },
              (error) => {
                obs.error(`Error de Conexion!...Error:${error}`);
                obs.complete();
              });
    });
  }

  getOne(idBanco: number): Observable<Banco> {
    return new Observable((obs) => {
      let obj = this.db.object(`${BANCOS_ROOT}${idBanco}/`)
                    .subscribe(
                        (banco) => {
                          obs.next(banco || {});
                          obj.unsubscribe();
                          obs.complete();
                        },
                        (error) => {
                          obs.error(error);
                          obj.unsubscribe();
                          obs.complete();
                        });
    });
  }

  getAll(): Observable<Banco[]> {
    return new Observable((obs) => {
      this.db.list(BANCOS_ROOT)
          .subscribe((bancos: Banco[]) => { obs.next(bancos || []); },
                     (error) => { obs.error(error); });
    });
  }

  private isUnique(banco: Banco, isNew: boolean = false): Observable<boolean> {
    return new Observable((obs) => {
      this.db.list(BANCOS_ROOT)
          .subscribe(
              (bancos: Banco[]) => {
                if (bancos) {
                  let otro = bancos.find((b) => {
                    if (isNew) {
                      return ((b.id == banco.id) ||
                              (b.Nombre.trim().toLowerCase() ==
                               banco.Nombre.trim().toLowerCase()));
                    } else {
                      return ((b.id != banco.id) &&
                              (b.Nombre.trim().toLowerCase() ==
                               banco.Nombre.trim().toLowerCase()));
                    }
                  });
                  obs.next((otro) ? false : true);
                  obs.complete();
                } else {
                  obs.next(true);
                  obs.complete();
                }
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }
}
