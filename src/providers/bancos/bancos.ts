import {UsuarioProvider} from './../usuario/usuario';
import {UserDoc, Usuario} from './../../models/user.class';
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
  private usuario: Usuario;
  constructor(private db: AngularFireDatabase,
              private usuarioP: UsuarioProvider) {
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }

  add(banco: Banco): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(banco, true)
          .subscribe(
              (isUnique) => {
                if (isUnique) {
                  if (!banco.Creador) {
                    banco.Creador = new UserDoc();
                  }
                  banco.Creador.Fecha = new Date().toISOString();
                  banco.Creador.Usuario = this.usuario;
                  let updData = {};
                  updData[`${BANCOS_ROOT}${banco.id}/`] = banco;
                  updData[`${LOG_BANCOS_CREADOS}${Date.now()}/`] = {
                    Fecha: new Date().toISOString(),
                    Banco: banco,
                    Usuario: banco.Creador
                  };
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
                  obs.error(`Ya existe el Banco ${banco.Nombre}!`);
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
                  if (!banco.Modificador) {
                    banco.Modificador = new UserDoc();
                  }
                  banco.Modificador.Fecha = new Date().toISOString();
                  banco.Modificador.Usuario = this.usuario;
                  let updData = {};
                  updData[`${BANCOS_ROOT}${banco.id}/`] = banco;
                  updData[`${LOG_BANCOS_MODIFICADOS}${Date.now()}/`] = {
                    Fecha: new Date().toISOString(),
                    Banco: banco,
                    Usuario: banco.Modificador
                  };
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
          .subscribe(
              (bancos: Banco[]) => {
                obs.next(bancos || []);
                obs.complete();
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }

  private isUnique(banco: Banco, isNew: boolean = false): Observable<boolean> {
    return new Observable((obs) => {
      let lst = this.db.list(BANCOS_ROOT)
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
                            lst.unsubscribe();
                            obs.complete();
                          } else {
                            obs.next(true);
                            lst.unsubscribe();
                            obs.complete();
                          }
                        },
                        (error) => {
                          obs.error(error);
                          lst.unsubscribe();
                          obs.complete();
                        });
    });
  }
}
