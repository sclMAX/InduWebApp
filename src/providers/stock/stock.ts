import {PEDIDO} from './../../models/pedidos.clases';
import {ContadoresProvider} from './../contadores/contadores';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {DocStockIngreso, DocStockItem} from './../../models/documentos.class';
import {Pedido} from './../../models/pedidos.clases';
import {
  Stock,
  StockEstado,
  StockEstadoPedidosDetalle,
  StockItem,
  StockPerfil
} from './../../models/stock.clases';
import {
  SUC_DOCUMENTOS_ROOT,
  SUC_DOCUMENTOS_STOCKINGRESOS_ROOT,
  SUC_STOCK_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';

@Injectable()
export class StockProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
              private constadorsP: ContadoresProvider){};

  genUpdateData(updData, idProducto, valor: Stock) {
    valor.Modificador = this.sucP.genUserDoc();
    valor.id = idProducto;
    updData[`${SUC_STOCK_ROOT}${idProducto}/`] = valor;
  }

  genMultiUpdadeData(updData, Items: DocStockItem[],
                     isIngreso: boolean): Observable<any> {
    return new Observable((obs) => {
      let loop = (idx: number) => {
        // Buscar stock actual
        this.getOne(Items[idx].Perfil.id)
            .subscribe(
                (stk) => {
                  let newStk: Stock;
                  let stkItem: StockItem;
                  let index: number = -1;
                  // Check Stock
                  if (stk && stk.Stocks) {  // Existe
                    newStk = stk;
                    // Buscar item
                    index = newStk.Stocks.findIndex(
                        (i) => { return (i.id == Items[idx].Color.id); });
                  } else {  // Si no existe
                    // Crear Stock y StockItem
                    newStk = new Stock();
                    newStk.Creador = this.sucP.genUserDoc();
                    newStk.id = Items[idx].Perfil.id;
                    newStk.Stocks = [];
                  }
                  // Check StockItem
                  if (index > -1) {  // Si existe se modifica
                    stkItem = newStk.Stocks[index];
                    stkItem.Modificador = this.sucP.genUserDoc();
                    if (isIngreso) {
                      // Agregar stock
                      stkItem.stock =
                          stkItem.stock * 1 + Items[idx].cantidad * 1;
                    } else {
                      // Restar stock
                      stkItem.stock =
                          stkItem.stock * 1 - Items[idx].cantidad * 1;
                    }
                    // Agregar el Item nuevo o modificado
                    newStk.Stocks[index] = stkItem;
                  } else {  // si no se crea
                    stkItem = new StockItem(Items[idx].Color.id,
                                            Items[idx].cantidad, 0);
                    stkItem.Creador = newStk.Creador;
                    // Agregar el Item nuevo o modificado
                    newStk.Stocks.push(stkItem);
                  }
                  // Generar UpdateData
                  this.genUpdateData(updData, Items[idx].Perfil.id, newStk);
                  idx++;
                  if (idx < Items.length) {  // Si quedan items
                    // Siguiente item
                    loop(idx);
                  } else {  // si no
                    // Retornar UpdateData
                    obs.next(updData);
                    obs.complete();
                  }
                },
                (error) => {
                  obs.error(`No se pudo actualizar el Stock! Error:${error}`);
                  obs.complete();
                });
      };
      // Loop para recorrer todos los Items
      loop(0);
    });
  }

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
      let fin = () => { (realtime) ? null : obs.complete(); };
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
      this.getOne(idProducto)
          .subscribe(
              (snap) => {
                if (snap.Stocks) {
                  let idx: number = -1;
                  idx = snap.Stocks.findIndex(
                      (i) => { return (i.id == idItem); });
                  obs.next((idx > -1) ? snap.Stocks[idx].stock : 0);
                  obs.complete();
                } else {
                  obs.next(0);
                  obs.complete();
                }
              },
              (error) => {
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
                data.forEach(
                    (i) => { res.push(new StockPerfil(i.$key, i.Stock)); });
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
      this.getStock(idProducto, idItem)
          .subscribe(
              (stock) => {
                res.stock = stock;
                this.db.list(`${SUC_DOCUMENTOS_ROOT}${PEDIDO}/`)
                    .subscribe(
                        (snap: Pedido[]) => {
                          snap.forEach((p) => {
                            p.Items.forEach((i) => {
                              if (i.Perfil.id == idProducto &&
                                  i.Color.id == idItem) {
                                res.Pedidos.push(new StockEstadoPedidosDetalle(
                                    i.cantidad, p.id, p.idCliente));
                                res.cantidadEnPedidos += i.cantidad * 1;
                              }
                            });
                          });
                          res.disponible =
                              res.stock * 1 - res.cantidadEnPedidos * 1;
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

  setIngreso(doc: DocStockIngreso): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Set id
      let nro: number = doc.numero;
      doc.id = doc.numero;
      // Set Creador
      doc.Creador = this.sucP.genUserDoc();
      // Set Items actualizados true
      doc.Items.forEach((i) => { i.isStockActualizado = true; });
      // Add stock ingreso
      updData[`${SUC_DOCUMENTOS_STOCKINGRESOS_ROOT}${nro}`] = doc;
      // Actualizar contador
      this.constadorsP.genStockIngresoUpdateData(updData, nro);
      // Generar UpdateData Multiple y Ejecutar peticion
      this.genMultiUpdadeData(updData, doc.Items, true)
          .subscribe(
              (data) => {
                updData = data;
                // Ejecutar Peticion
                this.db.database.ref()
                    .update(updData)
                    .then(() => {
                      obs.next('Stock Actualizado Correctamente!');
                      obs.complete();
                    })
                    .catch((error) => {
                      obs.error(
                          `No se pudo actualizar el Stock! Error:${error}`);
                      obs.complete();
                    });
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }
}
