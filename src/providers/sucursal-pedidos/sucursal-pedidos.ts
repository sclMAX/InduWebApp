import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {Pedido, PedidoItem} from './../../models/pedidos.clases';
import {SucursalContadores} from './../../models/sucursal.clases';
import {ClientesProvider} from './../clientes/clientes';
import {DolarProvider} from './../dolar/dolar';
import {SucursalStockProvider} from './../sucursal-stock/sucursal-stock';
import {SUC_CONTADORES_ROOT, SUC_DOCUMENTOS_PEDIDOS} from './../sucursal/sucursal';

@Injectable()
export class SucursalPedidosProvider {
  constructor(
      private db: AngularFireDatabase, private clientesP: ClientesProvider,
      private dolarP: DolarProvider, private stockP: SucursalStockProvider) {}

  public getAllCliente(idCliente: number): Observable<Pedido[]> {
    return new Observable((obs) => {
      this.db
          .list(
              `${SUC_DOCUMENTOS_PEDIDOS}`,
              {query: {orderByChild: 'idCliente', equalTo: idCliente}})
          .subscribe(
              (data: Pedido[]) => {
                console.log('PEDIDOS:', data);
                obs.next(data);
              },
              (error) => {
                obs.error(error);
              });
    });
  }

  public getPendientes(): Observable<Pedido[]> {
    return new Observable((obs) => {
      this.db
          .list(
              SUC_DOCUMENTOS_PEDIDOS,
              {query: {orderByChild: 'isPreparado', equalTo: false}})
          .subscribe(
              (data: Pedido[]) => {
                obs.next(data);
              },
              (error) => {
                obs.error(error);
              });
    });
  }

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
                      this.updateStockDisponible(0, pedido.Items, false);
                      obs.next(`Se guardo correctamete el pedido N: 00${Nro}`);
                      obs.complete();
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
                                `ERROR INESPERADO [SetContador:${removeError
                                }]... Se guardo el pedido con ERRORES, ANOTE el codio [P${pedido
                                    .id}C${pedido.idCliente
                                }PN${Nro}] y contacte al Adiminsitrador!`);
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

  public update(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      this.db.object(`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}`)
          .update(pedido)
          .then((ok) => {
            obs.next('Pedido actualizado correctamente!');
            obs.complete();
          })
          .catch(
              (error) => {
                obs.error(`Error al intentes actualizar!... ERROR: ${error}`);
                obs.complete();
              });
    });
  }

  private updateStockDisponible(
      idx: number, items: PedidoItem[], inc: boolean = false) {
    this.stockP
        .setStockDisponible(
            items[idx].Perfil.id, items[idx].Color.id,
            (inc) ? (items[idx].Cantidad) : (items[idx].Cantidad * -1))
        .subscribe((ok) => {}, (error) => {}, () => {
          idx++;
          if (idx < items.length) {
            this.updateStockDisponible(idx, items, inc);
          }
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
          .subscribe(
              (contadores: SucursalContadores) => {
                if (contadores.Pedidos >= 0) {
                  obs.next(contadores.Pedidos + 1);
                } else {
                  obs.error();
                }
              },
              (error) => {
                obs.error(error);
              });
    });
  }

  public calUnidades(i: PedidoItem): number {
    let u: number = 0.00;
    let pxm: number =
        (i.Color.isPintura) ? i.Perfil.PesoPintado : i.Perfil.PesoNatural;
    u = i.Cantidad * (pxm * (i.Perfil.Largo / 1000));
    return u;
  }

  public calPrecioU$(i: PedidoItem): number {
    let p: number = 0.00;
    p = i.Color.PrecioUs;
    return p;
  }

  public calSubTotalU$(i: PedidoItem): number {
    let s: number = 0.00;
    s = this.calUnidades(i) * this.calPrecioU$(i);
    return s;
  }

  public calTotalU$(items: PedidoItem[]): number {
    let tU$: number = 0.00;
    if (items) {
      items.forEach((i) => {
        tU$ += this.calSubTotalU$(i);
      });
      }
    return tU$;
  }

  public calTotal$(items: PedidoItem[]): Observable<number> {
    return new Observable((obs) => {
      let tU$: number = this.calTotalU$(items);
      this.dolarP.getDolarValor().subscribe(
          (vU$) => {
            obs.next(tU$ * vU$);
            obs.complete();
          },
          (error) => {
            obs.error(error);
            obs.complete();
          });
    });
  }

  public calTotalUnidades(items: PedidoItem[]): number {
    let tU: number = 0.00;
    if (items) {
      items.forEach((i) => {
        tU += this.calUnidades(i);
      });
      }
    return tU;
  }

  public calTotalBarras(items: PedidoItem[]): number {
    let tB: number = 0.00;
    if (items) {
      items.forEach((i) => {
        tB += (i.Cantidad * 1);
      });
      }
    return <number>tB;
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
