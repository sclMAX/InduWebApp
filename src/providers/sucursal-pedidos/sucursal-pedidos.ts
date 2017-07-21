import {ClientesProvider} from './../clientes/clientes';
import {Pedido} from './../../models/pedidos.clases';
import {SucursalContadores} from './../../models/sucursal.clases';
import {
  SUC_CONTADORES_ROOT,
  SUC_DOCUMENTOS_PEDIDOS
} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class SucursalPedidosProvider {
  constructor(private db: AngularFireDatabase,
              private clientesP: ClientesProvider) {}

  public add(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let Nro: number = pedido.Numero;
      pedido.id = pedido.Numero;
      this.db.database.ref(`${SUC_DOCUMENTOS_PEDIDOS}${pedido.Numero}/`)
          .set(pedido)
          .then((ok) => {
            this.setContador(pedido.Numero)
                .subscribe(
                    (setContadorOk) => {
                      this.clientesP.addPedido(pedido).subscribe(
                          (addPedidoOk) => {
                            obs.next(
                                `Se guardo correctamete el pedido N: 00${Nro}`);
                            obs.complete();
                          },
                          (addPedidoError) => {
                            obs.error(
                                `ERROR INESPERADO[Clientes Add Pedido:${addPedidoError}]... Se guardo el pedido con ERRORES, ANOTE el codio [P${pedido.id}C${pedido.idCliente}PN${Nro}] y contacte al Adiminsitrador!`);
                            obs.complete();
                          });
                    },
                    (setContadorError) => {
                      this.remove(pedido).subscribe(
                          (removeOk) => {
                            obs.error(
                                'Error de Conexion... No se pudo Guardar!');
                            obs.complete();
                          },
                          (removeError) => {
                            obs.error(
                                `ERROR INESPERADO [SetContador:${removeError}]... Se guardo el pedido con ERRORES, ANOTE el codio [P${pedido.id}C${pedido.idCliente}PN${Nro}] y contacte al Adiminsitrador!`);
                            obs.complete();
                          });
                    });
          })
          .catch((error) => {
            obs.error('Error de Conexion... No se pudo Guardar!');
            obs.complete();
          });
    });
  }

  private remove(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      if (pedido) {
        this.db.database.ref(`${SUC_DOCUMENTOS_PEDIDOS}${pedido.Numero}`)
            .remove()
            .then((ok) => {
              obs.next('Pedido Eliminado correctamente!');
              obs.complete();
            })
            .catch((error) => {
              obs.error('No se pudo Eliminar el pedido!');
              obs.complete();
            });
      } else {
        obs.error('No selecciono ningun pedido para Eliminar!');
        obs.complete();
      }
    });
  }

  public getCurrentNro(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(SUC_CONTADORES_ROOT)
          .subscribe((contadores: SucursalContadores) => {
            if (contadores.Pedidos >= 0) {
              obs.next(contadores.Pedidos + 1);
            } else {
              obs.error();
            }
          }, (error) => { obs.error(error); });
    });
  }

  private setContador(nro: number): Observable<boolean> {
    return new Observable((obs) => {
      if (nro > 0) {
        this.db.database.ref(`${SUC_CONTADORES_ROOT}Pedidos/`)
            .set(nro)
            .then((ok) => {
              obs.next(true);
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
}
