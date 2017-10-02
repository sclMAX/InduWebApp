import {ColoresProvider} from './../colores/colores';
import {ProductosProvider} from './../productos/productos';
import {FECHA} from './../../models/comunes.clases';
import {PEDIDO} from './../../models/pedidos.clases';
import {ContadoresProvider} from './../contadores/contadores';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/first';

import {DocStockIngreso, DocStockItem} from './../../models/documentos.class';
import {Pedido} from './../../models/pedidos.clases';
import {
  Stock,
  StockEstado,
  StockEstadoPedidosDetalle,
  StockItem
} from './../../models/stock.clases';
import {
  SUC_DOCUMENTOS_ROOT,
  SUC_DOCUMENTOS_STOCKINGRESOS_ROOT,
  SUC_STOCK_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';
import * as moment from 'moment';

@Injectable()
export class StockProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
              private productosP: ProductosProvider,
              private coloresP: ColoresProvider,
              private constadorsP: ContadoresProvider){};

  genUpdateData(updData, idProducto, valor: Stock) {
    valor.Modificador = this.sucP.genUserDoc();
    valor.id = idProducto;
    updData[`${SUC_STOCK_ROOT}${idProducto}/`] = valor;
  }

  genMultiUpdadeData(updData, Items: DocStockItem[],
                     isIngreso: boolean): Observable<any> {
    return new Observable((obs) => {
      let oldItems = JSON.parse(JSON.stringify(Items));
      let stks: Stock[] = [];
      let loop = (idx: number) => {
        let item = Items[idx];
        let chkFin = (idx) => {
          idx++;
          if (idx < Items.length) {  // Si quedan items
            // Siguiente item
            loop(idx);
          } else {  // si no
            // Retornar UpdateData
            obs.next(updData);
            obs.complete();
          }
        };
        if (!(item.isStockActualizado) && !(item.Perfil.notInStock)) {
          // Buscar stock actual
          this.getOne(item.Perfil.id)
              .subscribe(
                  (stk) => {
                    let newStk: Stock;
                    let newItem: StockItem;
                    // Proceso de actualizacion
                    let actualizarStk = (vStk): number => {
                      if (isIngreso) {
                        vStk += Number(item.cantidad);
                      } else {
                        vStk -= Number(item.cantidad);
                      }
                      return vStk;
                    };
                    // Check Stock
                    if (stk && stk.Stocks) {
                      newStk = stk;
                    } else {
                      newStk = new Stock();
                      newStk.id = item.Perfil.id;
                      newStk.Creador = this.sucP.genUserDoc();
                      newItem = new StockItem(item.Color.id, 0, 0);
                      newItem.Creador = newStk.Creador;
                      newStk.Stocks = [newItem];
                    }
                    // Buscar si existe en la lista de actualizacion
                    let es = stks.find((s) => { return s.id == newStk.id; });
                    let index = -1;
                    if (es) {  // si existe en la lista
                      // busco si existe el item
                      let index = es.Stocks.findIndex(
                          (i) => { return i.id == item.Color.id; });
                      if (index > -1) {  // si existe el item se actualiza
                        es.Stocks[index].stock =
                            actualizarStk(es.Stocks[index].stock);
                      } else {  // si no existe
                        // Buscar si exite en la DB
                        index = newStk.Stocks.findIndex(
                            (i) => { return i.id == item.Color.id; });
                        if (index > -1) {  // si ya existe en DB se actualiza
                          newStk.Stocks[index].Modificador =
                              this.sucP.genUserDoc();
                          newStk.Stocks[index].stock =
                              actualizarStk(newStk.Stocks[index].stock);
                        } else {
                          newItem = new StockItem(item.Color.id, 0, 0);
                          newItem.Creador = this.sucP.genUserDoc();
                          newItem.stock = actualizarStk(newItem.stock);
                          newStk.Stocks.push(newItem);
                        }
                        // se agrega item a la lista
                        es.Stocks.push(newItem);
                      }
                      // Se iguala con la lista
                      newStk = es;
                    } else {  // Si no esta en la lista
                      // Buscar Item
                      index = newStk.Stocks.findIndex(
                          (i) => { return i.id == item.Color.id; });
                      if (index > -1) {  // Si existe se actualiza
                        newStk.Stocks[index].Modificador =
                            this.sucP.genUserDoc();
                        newStk.Stocks[index].stock =
                            actualizarStk(newStk.Stocks[index].stock);
                      } else {  // si no existe se crea actualiza y agrega
                        newItem = new StockItem(item.Color.id, 0, 0);
                        newItem.Creador = this.sucP.genUserDoc();
                        newItem.stock = actualizarStk(newItem.stock);
                        newStk.Stocks.push(newItem);
                      }
                      // Agrego stok a lista de actualizacion
                      stks.push(newStk);
                    }
                    // Generar UpdateData
                    this.genUpdateData(updData, item.Perfil.id, newStk);
                    // Set Flag
                    item.isStockActualizado = true;
                    // Incremetar Contador
                    chkFin(idx);
                  },
                  (error) => {
                    Items = oldItems;
                    obs.error(`No se pudo actualizar el Stock! Error:${error}`);
                    obs.complete();
                  });
        } else {
          chkFin(idx);
        }
        // fin
      };
      // Loop para recorrer todos los Items
      loop(0);
    });
  }

  getAll(realtime: boolean = false): Observable<Stock[]> {
    return this.db.list(SUC_STOCK_ROOT)
        .map((stks: Stock[]) => { return (stks || []); });
  }

  getOne(idProducto: string, realtime: boolean = false): Observable<Stock> {
    return this.db.object(`${SUC_STOCK_ROOT}${idProducto}/`)
        .map((data: Stock) => { return data; });
  }

  getOneTotalBarras(idProducto: string): Promise<number> {
    return this.getOne(idProducto)
        .map(data => {
          if (data) {
            return data.Stocks.reduce((sum, current) => sum + current.stock, 0);
          }
        })
        .first()
        .toPromise();
  }
  async getTotalKilos(): Promise<number> {
    return new Promise<number>(async(res, rej) => {
      this.getAll()
          .map(async(stocks) => {
            let total: number = 0.00;
            for (let item of stocks) {
              let perfil = await this.productosP.getPerfil(item.id);
              for (let s of item.Stocks) {
                let color = await this.coloresP.getColor(s.id);
                if (color.isPintura) {
                  total +=
                      (s.stock * (perfil.pesoPintado * (perfil.largo / 1000)));
                } else {
                  total +=
                      (s.stock * (perfil.pesoNatural * (perfil.largo / 1000)));
                }
              }
            }
            return total;
          })
          .subscribe(total => res(total), err => rej(err));
    });
  }

  getOneStokcs(idProducto: string): Observable<StockItem[]> {
    return this.db.list(`${SUC_STOCK_ROOT}${idProducto}/Stocks/`)
        .map((snap: StockItem[]) => {
          return snap.sort((a, b) => {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
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

  setMpp(stock: Stock): Observable<string> {
    return new Observable((obs) => {
      this.db.object(`${SUC_STOCK_ROOT}${stock.id}/Stocks/`)
          .set(stock.Stocks)
          .then(() => {
            obs.next('Actualizacion Exitosa!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo actualizar! Error:${error}`);
            obs.complete();
          });
    });
  }

  getIngresos(): Observable<DocStockIngreso[]> {
    return this.db.list(SUC_DOCUMENTOS_STOCKINGRESOS_ROOT)
        .map((snap: DocStockIngreso[]) => {return snap.sort((a, b) => {
               return moment(a.fecha, FECHA).diff(moment(b.fecha, FECHA));
             })});
  }
}
