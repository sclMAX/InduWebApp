import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {Cliente} from '../../models/clientes.clases';
import {
  COMUN_CONTADORES,
  COMUN_CONTADORES_CLIENTES
} from '../../models/db-base-paths';
import {SUC_CLIENTES_ROOT} from '../sucursal/sucursal';

@Injectable()
export class ClientesProvider {
  constructor(private db: AngularFireDatabase) {}

  public getAll(): Observable<Cliente[]> { return this.db.list(SUC_CLIENTES_ROOT); }

  public getOne(id: number): Observable<Cliente> {
    return this.db.object(`${SUC_CLIENTES_ROOT}${id}`);
  }

  public add(newCliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(newCliente)
          .subscribe(
              (isUniqueOk) => {
                if (isUniqueOk) {
                  this.db.database.ref(`${SUC_CLIENTES_ROOT}${newCliente.id}`)
                      .set(newCliente)
                      .then((okAdd) => {
                        this.setCurrentId(newCliente.id)
                            .subscribe(
                                (setIdOk) => {
                                  obs.next(
                                      `Se guardo correctamente el Cliente${newCliente
                                          .Nombre}`);
                                  obs.complete();
                                },
                                (setIderror) => {
                                  this.remove(newCliente)
                                      .subscribe(
                                          (removeOk) => {
                                            obs.error(
                                                `No se pudo agregar el Cliente: ${newCliente
                                                    .Nombre}`);
                                            obs.complete();
                                          },
                                          (removeError) => {
                                            obs.error(
                                                `ERROR: Se agrego el Cliente: ${newCliente
                                                    .Nombre
                                                }, COntacte al Administrador y anote el Codigo:${newCliente
                                                    .id}`);
                                            obs.complete();
                                          });

                                });
                      })
                      .catch((errAdd) => {
                        obs.error(`No se pudo agregar el Cliente: ${newCliente
                                      .Nombre}`);
                        obs.complete();
                      });
                } else {
                  obs.error(
                      `No se puede guardar!.Ya existe un cliente ${newCliente
                          .Nombre}.`);
                  obs.complete();
                }
              },
              (errisUnique) => {
                obs.error('Error Insesperado!');
                obs.complete();
              });
    });
  }

  public update(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(cliente).subscribe(
          (isUniqueOk) => {
            if (isUniqueOk) {
              this.db.database.ref(`${SUC_CLIENTES_ROOT}${cliente.id}/`)
                  .set(cliente)
                  .then((updateOk) => {
                    obs.next(`Cambios guardados correctamente!`);
                    obs.complete();
                  })
                  .catch((updateError) => {
                    obs.error(
                        'Error insesperado... No se pudo guradar, revise su conexion!');
                    obs.complete();
                  });
            } else {
              obs.error(`Ya existe un Cliente ${cliente.Nombre}!`);
              obs.complete();
            }
          },
          (isUniqueError) => {
            obs.error(`Error de Conexion... No se pudo guardar!`);
            obs.complete();
          });
    });
  }

  public remove(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.db.database.ref(`${SUC_CLIENTES_ROOT}${cliente.id}`)
          .remove()
          .then(() => {
            obs.next(`Cliente ${cliente.Nombre} Eliminado!`);
            obs.complete();
          })
          .catch((error) => {
            obs.error(
                `Error al intentar Eliminar el Cliente ${cliente.Nombre} !`);
            obs.complete();
          });
    });
  }

  public getCurrentNewId(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(`${COMUN_CONTADORES}`)
          .subscribe((cont) => {
            if (cont.Clientes >= 0) {
              obs.next(cont.Clientes + 1);
            } else {
              obs.error('Contador Clientes no Encontrado!');
            }
          });
    });
  }

  private setCurrentId(id: number): Observable<any> {
    return new Observable((obs) => {
      if (id >= 0) {
        this.db.database.ref(`${COMUN_CONTADORES_CLIENTES}`)
            .set(id)
            .then(() => {
              obs.next();
              obs.complete();
            })
            .catch((error) => {
              obs.error(error);
              obs.complete();
            });
      } else {
        obs.error();
        obs.complete();
      }
    });
  }

  private isUnique(cliente: Cliente): Observable<boolean> {
    return new Observable((obs) => {
      this.getAll().subscribe(
          (clientes) => {
            let c = clientes.find(item => {
              return ((item.Nombre.trim().toLocaleLowerCase() ===
                       cliente.Nombre.trim().toLocaleLowerCase()) &&
                      (item.id != cliente.id));
            });
            if (c && c.id >= 0) {
              obs.next(false);
            } else {
              obs.next(true);
            }
            obs.complete()
          },
          (error) => {
            obs.error();
            obs.complete();
          });
    });
  }
}
