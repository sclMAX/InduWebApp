import {SucursalProvider} from './../sucursal/sucursal';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {Cliente} from '../../models/clientes.clases';
import {COMUN_CONTADORES_CLIENTES} from '../../models/db-base-paths';
import {SUC_CLIENTES_ROOT, SUC_LOG_ROOT} from '../sucursal/sucursal';

@Injectable()
export class ClientesProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider) {
  }

  add(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(cliente).subscribe(
          (isUniqueOk) => {
            if (isUniqueOk) {
              cliente.Creador = this.sucP.genUserDoc();
              let updData = {};
              updData[`${SUC_CLIENTES_ROOT}${cliente.id}`] = cliente;
              updData[`${COMUN_CONTADORES_CLIENTES}`] = cliente.id;
              let log = this.sucP.genLog(cliente);
              updData[`${SUC_LOG_ROOT}Clientes/Creados/${log.id}/`] = log;
              this.db.database.ref()
                  .update(updData)
                  .then((okAdd) => {
                    obs.next(`Se guardo correctamente el Cliente${cliente
                                          .Nombre}`);
                    obs.complete();

                  })
                  .catch((errAdd) => {
                    obs.error(`No se pudo agregar el Cliente: ${cliente
                                      .Nombre}`);
                    obs.complete();
                  });
            } else {
              obs.error(`No se puede guardar!.Ya existe un cliente ${cliente
                          .Nombre}.`);
              obs.complete();
            }
          },
          (errisUnique) => {
            obs.error(`Sin Conexion!... Error:${errisUnique}`);
            obs.complete();
          });
    });
  }

  update(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(cliente).subscribe(
          (isUniqueOk) => {
            if (isUniqueOk) {
              cliente.Modificador = this.sucP.genUserDoc();
              let updData = {};
              updData[`${SUC_CLIENTES_ROOT}${cliente.id}/`] = cliente;
              let log = this.sucP.genLog(cliente);
              updData[`${SUC_LOG_ROOT}Clientes/Modificados/${log.id}/`] = log;
              this.db.database.ref()
                  .update(updData)
                  .then((updateOk) => {
                    obs.next(`Cambios guardados correctamente!`);
                    obs.complete();
                  })
                  .catch((updateError) => {
                    obs.error(
                        `No se pudo guardar, revise su conexion! Error:${updateError}`);
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

  remove(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      updData[`${SUC_CLIENTES_ROOT}${cliente.id}/`] = {};
      let log = this.sucP.genLog(cliente);
      updData[`${SUC_LOG_ROOT}Clientes/Eliminados/${log.id}/`] = log;
      this.db.database.ref()
          .update(updData)
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

  getAll(): Observable<Cliente[]> {
    return new Observable((obs) => {
      this.db.list(SUC_CLIENTES_ROOT)
          .subscribe(
              (clientes: Cliente[]) => {
                if (clientes) {
                  obs.next(clientes);
                } else {
                  obs.error();
                }
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }

  getOne(id: number): Observable<Cliente> {
    return this.db.object(`${SUC_CLIENTES_ROOT}${id}`);
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
