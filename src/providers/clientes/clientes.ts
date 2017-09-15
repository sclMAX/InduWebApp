import { AngularFireDatabase } from 'angularfire2/database';
import { ContadoresProvider } from './../contadores/contadores';
import { SucursalProvider } from './../sucursal/sucursal';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import { Cliente } from '../../models/clientes.clases';
import { SUC_CLIENTES_ROOT, SUC_LOG_ROOT } from '../sucursal/sucursal';

@Injectable()
export class ClientesProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
    private contadoresP: ContadoresProvider) { }

  add(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(cliente).subscribe(
        (isUniqueOk) => {
          if (isUniqueOk) {
            cliente.Creador = this.sucP.genUserDoc();
            let updData = {};
            // Add Cliente
            updData[`${SUC_CLIENTES_ROOT}${cliente.id}/`] = cliente;
            // Set Contador
            this.contadoresP.genClientesUpdateData(updData, cliente.id);
            // Log
            let log = this.sucP.genLog(cliente);
            updData[`${SUC_LOG_ROOT}Clientes/Creados/${log.id}/`] = log;
            // Actualizar
            this.db.database.ref()
              .update(updData)
              .then((okAdd) => {
                obs.next(`Se guardo correctamente el Cliente${cliente
                  .nombre}`);
                obs.complete();

              })
              .catch((errAdd) => {
                obs.error(`No se pudo agregar el Cliente: ${cliente
                  .nombre}`);
                obs.complete();
              });
          } else {
            obs.error(`No se puede guardar!.Ya existe un cliente ${cliente
              .nombre}.`);
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
            obs.error(`Ya existe un Cliente ${cliente.nombre}!`);
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
          obs.next(`Cliente ${cliente.nombre} Eliminado!`);
          obs.complete();
        })
        .catch((error) => {
          obs.error(
            `Error al intentar Eliminar el Cliente ${cliente.nombre} !`);
          obs.complete();
        });
    });
  }

  getAll(): Observable<Cliente[]> {
    return this.db.list(SUC_CLIENTES_ROOT);
  }

  getOne(id: number): Observable<Cliente> {
    return new Observable((obs) => {
      this.db.object(`${SUC_CLIENTES_ROOT}${id}`)
        .subscribe((snap) => { obs.next(snap || null); },
        (error) => { obs.error(error); });
    });
  }

  private isUnique(cliente: Cliente): Observable<boolean> {
    return new Observable((obs) => {
      this.getAll().subscribe(
        (clientes) => {
          let c = clientes.find(item => {
            return ((item.nombre.trim().toLocaleLowerCase() ===
              cliente.nombre.trim().toLocaleLowerCase()) &&
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
