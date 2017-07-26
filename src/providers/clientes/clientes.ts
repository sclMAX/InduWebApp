import {UsuarioProvider} from './../usuario/usuario';
import {UserDoc, Usuario} from './../../models/user.class';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {Cliente} from '../../models/clientes.clases';
import {
  COMUN_CONTADORES,
  COMUN_CONTADORES_CLIENTES
} from '../../models/db-base-paths';
import {SUC_CLIENTES_ROOT, SUC_LOG_ROOT} from '../sucursal/sucursal';
import {Pedido} from './../../models/pedidos.clases';

@Injectable()
export class ClientesProvider {
  usuario: Usuario = new Usuario();
  constructor(private db: AngularFireDatabase,
              private usuarioP: UsuarioProvider) {
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }

  add(cliente: Cliente): Observable<string> {
    return new Observable((obs) => {
      this.isUnique(cliente).subscribe(
          (isUniqueOk) => {
            if (isUniqueOk) {
              if (!cliente.Creador) {
                cliente.Creador = new UserDoc();
              }
              cliente.Creador.Fecha = new Date().toISOString();
              cliente.Creador.Usuario = this.usuario;
              let updData = {};
              updData[`${SUC_CLIENTES_ROOT}${cliente.id}`] = cliente;
              updData[`${COMUN_CONTADORES_CLIENTES}`] = cliente.id;
              updData[`${SUC_LOG_ROOT}Clientes/Creados/${Date.now()}/`] = {
                Cliente: cliente,
                Usuario: this.usuario,
                Fecha: new Date().toISOString(),
                Comentario: 'Cliente Nuevo'
              };
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
              if (!cliente.Modificador) {
                cliente.Modificador = new UserDoc();
              }
              cliente.Modificador.Fecha = new Date().toISOString();
              cliente.Modificador.Usuario = this.usuario;
              let updData = {};
              updData[`${SUC_CLIENTES_ROOT}${cliente.id}/`] = cliente;
              updData[`${SUC_LOG_ROOT}Clientes/Modificados/${Date.now()}/`] = {
                Cliente: cliente,
                Usuario: this.usuario,
                Fecha: new Date().toISOString(),
                Comentario: 'Cliente Modificado!'
              };
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
      updData[`${SUC_LOG_ROOT}Clientes/Eliminados/${Date.now()}/`] = {
        Cliente: cliente,
        Usuario: this.usuario,
        Fecha: new Date().toISOString(),
        Comentario: 'Cliente Eliminado!'
      };
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

  getAll(): Observable<Cliente[]> { return this.db.list(SUC_CLIENTES_ROOT); }

  getOne(id: number): Observable<Cliente> {
    return this.db.object(`${SUC_CLIENTES_ROOT}${id}`);
  }

  getCurrentNewId(): Observable<number> {
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
