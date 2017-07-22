import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {Pedido, PedidoItem} from './../../models/pedidos.clases';
import {Stock, StockEstado, StockEstadoPedidosDetalle} from './../../models/productos.clases';
import {SUC_DOCUMENTOS_PEDIDOS, SUC_STOCK_ROOT} from './../sucursal/sucursal';

@Injectable()
export class StockProvider {
  constructor(private db: AngularFireDatabase){};

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
            this.db
                .list(
                    SUC_DOCUMENTOS_PEDIDOS,
                    {query: {orderByChild: 'isPreparado', equalTo: false}})
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
                      console.log('RES:', res);
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
}
