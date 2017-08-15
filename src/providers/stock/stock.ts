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
      let stks: Stock[] = [];
      let loop = (idx: number) => {
        // Buscar stock actual
        this.getOne(Items[idx].Perfil.id)
            .subscribe(
                (stk) => {
                  let newStk: Stock;
                  let newItem: StockItem;
                  // Check Stock
                  if (stk && stk.Stocks) {
                    newStk = stk;
                  } else {
                    newStk = new Stock();
                    newStk.id = Items[idx].Perfil.id;
                    newStk.Creador = this.sucP.genUserDoc();
                    newItem = new StockItem(Items[idx].Color.id, 0, 0);
                    newItem.Creador = newStk.Creador;
                    newStk.Stocks = [newItem];
                  }
                  // Buscar si existe en la lista de actualizacion
                  let es = stks.find((s) => { return s.id == newStk.id; });
                  let index = -1;
                  if (es) {  // si existe en la lista
                    //busco si existe el item
                    let index = es.Stocks.findIndex(
                        (i) => { return i.id == Items[idx].Color.id; });
                    if(index > -1){ //si existe el item se actualiza
                      if (isIngreso) {
                        es.Stocks[index].stock += Items[idx].cantidad * 1;
                      } else {
                        es.Stocks[index].stock -= Items[idx].cantidad * 1;
                      }                      
                    }else{//si no existe
                      //Buscar si exite en la DB
                      index = newStk.Stocks.findIndex((i)=>{
                        return i.id == Items[idx].Color.id;
                      });
                      if(index >-1){ // si ya existe en DB se actualiza
                        newStk.Stocks[index].Modificador = this.sucP.genUserDoc();
                        if (isIngreso) {
                          newStk.Stocks[index].stock += Items[idx].cantidad * 1;
                        } else {
                          newStk.Stocks[index].stock -= Items[idx].cantidad * 1;
                        }
                      }else{
                        newItem = new StockItem(Items[idx].Color.id, 0, 0);
                        newItem.Creador = this.sucP.genUserDoc();
                        if (isIngreso) {
                          newItem.stock += Items[idx].cantidad * 1;
                        } else {
                          newItem.stock -= Items[idx].cantidad * 1;
                        }
                        newStk.Stocks.push(newItem);
                      }
                      // se agrega item a la lista
                      es.Stocks.push(newItem);
                    }
                    //Se iguala con la lista 
                    newStk = es;
                  } else {  // Si no esta en la lista
                    // Buscar Item
                    index = newStk.Stocks.findIndex(
                        (i) => { return i.id == Items[idx].Color.id; });
                    if (index > -1) {  // Si existe se actualiza
                      newStk.Stocks[index].Modificador = this.sucP.genUserDoc();
                      if (isIngreso) {
                        newStk.Stocks[index].stock += Items[idx].cantidad * 1;
                      } else {
                        newStk.Stocks[index].stock -= Items[idx].cantidad * 1;
                      }
                    } else {  // si no existe se crea actualiza y agrega
                      newItem = new StockItem(Items[idx].Color.id, 0, 0);
                      newItem.Creador = this.sucP.genUserDoc();
                      if (isIngreso) {
                        newItem.stock += Items[idx].cantidad * 1;
                      } else {
                        newItem.stock -= Items[idx].cantidad * 1;
                      }
                      newStk.Stocks.push(newItem);
                    }
                    // Agrego stok a lista de actualizacion
                    stks.push(newStk);
                  }
                  // Generar UpdateData
                  this.genUpdateData(updData, Items[idx].Perfil.id, newStk);
                  //Set Flag 
                  Items[idx].isStockActualizado = true;
                  // Incremetar Contador
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
