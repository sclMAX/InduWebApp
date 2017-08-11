import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {DocStockIngreso, DocStockItem} from './../../models/documentos.class';
import {Pedido, PedidoItem} from './../../models/pedidos.clases';
import {Stock, StockEstado, StockEstadoPedidosDetalle, StockItem, StockPerfil} from './../../models/stock.clases';
import {SucursalContadores} from './../../models/sucursal.clases';
import {SUC_CONTADORES_ROOT, SUC_DOCUMENTOS_PEDIDOS, SUC_DOCUMENTOS_STOCKINGRESOS_ROOT, SUC_STOCK_ROOT, SucursalProvider} from './../sucursal/sucursal';

@Injectable()
export class StockProvider {
  constructor(
      private db: AngularFireDatabase, private sucP: SucursalProvider){};

  getAll(realtime: boolean = false): Observable<Stock[]> {
    return new Observable((obs) => {
      let fin = () => {
        if (!realtime) {
          obs.complete();
        }
      };
      this.db.list(SUC_STOCK_ROOT)
          .subscribe(
              (stks) => {
                obs.next(stks || []);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
  }

  getOne(idProducto: string, realtime: boolean = false): Observable<Stock> {
    return new Observable((obs) => {
      let fin = () => {
        if (!realtime) {
          obs.complete();
        }
      };
      this.db.object(`${SUC_STOCK_ROOT}${idProducto}/`)
          .subscribe(
              (data: Stock) => {
                obs.next(data || null);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
  }

  getStock(idProducto, idItem): Observable<number> {
    return new Observable((obs) => {
      this.db.database
          .ref(`${SUC_STOCK_ROOT}${idProducto}/Stokcs/${idItem}/stock`)
          .once('value')
          .then((stock: number) => {
            obs.next(stock || 0);
            obs.complete();
          })
          .catch((error) => {
            obs.error(error);
            obs.complete();
          });
    });
  }

  getStockPerfil(idProducto): Observable<StockPerfil[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_STOCK_ROOT}${idProducto}/`)
          .subscribe(
              (data) => {
                let res: StockPerfil[] = [];
                data.forEach((i) => {
                  res.push(new StockPerfil(i.$key, i.Stock));
                });
                obs.next(res);
                obs.complete();
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });

    });
  }

  getEstado(idProducto, idItem): Observable<StockEstado> {
    return new Observable((obs) => {
      let res: StockEstado = new StockEstado();
      if (!res.pedidos) {
        res.pedidos = [];
      }
      this.getStock(idProducto, idItem)
          .subscribe(
              (stock) => {
                res.stock = stock;
                this.db
                    .list(SUC_DOCUMENTOS_PEDIDOS, {
                      query:
                          {orderByChild: 'isStockActualizado', equalTo: false}
                    })
                    .subscribe(
                        (data: Pedido[]) => {
                          for (let i = 0; i < data.length; i++) {
                            for (let x = 0; x < data[i].Items.length; x++) {
                              if (data[i].Items[x].Perfil.id == idProducto &&
                                  data[i].Items[x].Color.id == idItem) {
                                res.pedidos.push(new StockEstadoPedidosDetalle(
                                    data[i].Items[x].Cantidad, data[i].id,
                                    data[i].idCliente));
                              }
                            }
                          }
                          obs.next(res);
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

  private updateStockItemsSubProceso(
      items: PedidoItem[], observable: any, updateData?: any, idx?: number) {
    if (!idx) {
      idx = 0;
      }
    if (!updateData) {
      updateData = {};
    }
    this.getStock(items[idx].Perfil.id, items[idx].Color.id)
        .subscribe(
            (stk) => {
              if (!items[idx].isStockActualizado) {
                updateData[`${items[idx].Perfil.id}/${items[idx].Color.id
                           }/Stock`] = ((stk) ? stk : 0) - items[idx].Cantidad;
              }
              idx++;
              if (idx < items.length) {
                this.updateStockItemsSubProceso(
                    items, observable, updateData, idx);
              } else {
                this.db.database.ref(SUC_STOCK_ROOT)
                    .update(updateData)
                    .then(() => {
                      observable.next(`Se actualizaron ${idx} registros!`);
                      observable.complete();
                    })
                    .catch((error) => {
                      observable.error(`Error al Actualizar ERROR:${error}`);
                      observable.complete();
                    });
              }
            },
            (error) => {
              observable.error(error);
              observable.complete();
            });
  }

  setIngreso(doc: DocStockIngreso): Observable<string> {
    return new Observable((obs) => {
      if (doc && SUC_DOCUMENTOS_STOCKINGRESOS_ROOT) {
        let updData = {};
        doc.id = doc.Numero;
        doc.Creador = this.sucP.genUserDoc();
        doc.Items.forEach((i) => {
          i.isStockActualizado = true;
        });
        updData[`${SUC_DOCUMENTOS_STOCKINGRESOS_ROOT}${doc.id}`] = doc;
        updData[`${SUC_CONTADORES_ROOT}DocStockIngreso/`] = doc.id;
        let loop = (idx: number) => {
          this.getOne(doc.Items[idx].Perfil.id)
              .subscribe(
                  (stk) => {
                    if (!stk.id) {  // Si no existe se crea
                      stk = new Stock();
                      stk.Creador = this.sucP.genUserDoc();
                      stk.id = doc.Items[idx].Perfil.id;
                      let newItem: StockItem = new StockItem();
                      newItem.Creador = stk.Creador;
                      newItem.id = doc.Items[idx].Color.id;
                      newItem.stock = doc.Items[idx].Cantidad * 1;
                      stk.Stocks = [newItem];
                    } else {  // si Existe se modifica
                      stk.Modificador = this.sucP.genUserDoc();
                      let itemIndex = -1;
                      if (stk.Stocks) {  // si tiene items se busca
                        itemIndex = stk.Stocks.findIndex((i) => {
                          return i.id == doc.Items[idx].Color.id;
                        });
                      } else {  // si no tiene items se setea a []
                        stk.Stocks = [];
                        }
                      if (itemIndex >
                          -1) {  // si se ecuentra el item se modifica
                        stk.Stocks[itemIndex].Modificador =
                            this.sucP.genUserDoc();
                        stk.Stocks[itemIndex].stock +=
                            doc.Items[idx].Cantidad * 1;
                      } else {  // si no se encuentra de crea y agrega
                        let newItem: StockItem = new StockItem();
                        newItem = new StockItem();
                        newItem.Creador = this.sucP.genUserDoc();
                        newItem.id = doc.Items[idx].Color.id;
                        newItem.stock = doc.Items[idx].Cantidad * 1;
                        stk.Stocks.push(newItem);
                      }
                    }

                    updData[`${SUC_STOCK_ROOT}${stk.id}/`] =
                        JSON.parse(JSON.stringify(stk));
                    idx++;
                    if (idx < doc.Items.length) {
                      loop(idx);
                    } else {
                      this.db.database.ref()
                          .update(updData)
                          .then(() => {
                            obs.next('Stock actualizado Correctamente!');
                            obs.complete();
                          })
                          .catch((error) => {
                            obs.error('No se pudo actualizar el Stock!');
                            obs.complete();
                          });
                    }
                  },
                  (error) => {
                    obs.error('No se pudo actualizar el Stock!');
                    obs.complete();
                  });
        };
        loop(0);
      } else {
        obs.error('Faltan datos!');
        obs.complete();
      }

    });
  }
}
