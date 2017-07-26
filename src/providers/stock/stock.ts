import { DocStockIngreso } from './../../models/documentos.class';
import { AngularFireDatabase } from 'angularfire2/database';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {Pedido, PedidoItem} from './../../models/pedidos.clases';
import {
  Stock,
  StockEstado,
  StockEstadoPedidosDetalle
} from './../../models/productos.clases';
import {SUC_DOCUMENTOS_PEDIDOS, SUC_STOCK_ROOT} from './../sucursal/sucursal';

@Injectable()
export class StockProvider {
  constructor(private db: AngularFireDatabase){};

  public getAll(): Observable<any[]> {
    return new Observable((obs) => {
      this.db.list(SUC_STOCK_ROOT)
          .subscribe((stks) => { obs.next(stks); },
                     (error) => { obs.error(error); });
    });
  }
  public getStock(item: Stock): Observable<number> {
    return new Observable((obs) => {
      this.db.database
          .ref(`${SUC_STOCK_ROOT}${item.idPerfil}/${item.idColor}/Stock`)
          .once('value')
          .then((stock) => {
            obs.next(stock.val() || 0);
            obs.complete();
          })
          .catch((error) => {
            obs.error(error);
            obs.complete();
          });
    });
  }

  public getEstado(item: Stock): Observable<StockEstado> {
    return new Observable((obs) => {
      let res: StockEstado = new StockEstado();
      this.getStock(item).subscribe(
          (stock) => {
            res.stock = stock;
            this.db.list(SUC_DOCUMENTOS_PEDIDOS,
                         {
                           query: {
                             orderByChild: 'isStockActualizado',
                             equalTo: false
                           }
                         })
                .subscribe(
                    (data: Pedido[]) => {
                      for (let i = 0; i < data.length; i++) {
                        for (let x = 0; x < data[i].Items.length; x++) {
                          if (data[i].Items[x].Perfil.id == item.idPerfil &&
                              data[i].Items[x].Color.id == item.idColor) {
                            res.addPedido(new StockEstadoPedidosDetalle(
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

  public update(item: Stock): Observable<string> {
    return new Observable((obs) => {
      this.db.object(`${SUC_STOCK_ROOT}${item.idPerfil}/${item.idColor}/Stock`)
          .update(item.stock)
          .then((ok) => {
            obs.next('Stock Actualizado correctamente!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(error);
            obs.complete();
          });

    });
  }

  public updateStockItems(items: PedidoItem[]): Observable<string> {
    return new Observable(
        (obs) => { this.updateStockItemsSubProceso(items, obs); });
  }

  private updateStockItemsSubProceso(items: PedidoItem[], observable: any,
                                     updateData?: any, idx?: number) {
    if (!idx) {
      idx = 0;
    }
    if (!updateData) {
      updateData = {};
    }
    this.getStock(new Stock(items[idx].Perfil.id, items[idx].Color.id))
        .subscribe(
            (stk) => {
              if (!items[idx].isStockActualizado) {
                updateData
                    [`${items[idx].Perfil.id}/${items[idx].Color.id}/Stock`] =
                        ((stk) ? stk : 0) - items[idx].Cantidad;
              }
              idx++;
              if (idx < items.length) {
                this.updateStockItemsSubProceso(items, observable, updateData,
                                                idx);
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

setIngreso(doc:DocStockIngreso){

}

}

