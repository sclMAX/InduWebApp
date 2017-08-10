import {UsuarioProvider} from './../usuario/usuario';
import {Usuario} from './../../models/user.class';
import {FECHA} from './../../models/comunes.clases';
import {CtasCtesProvider} from './../ctas-ctes/ctas-ctes';
import {
  DescuentosProvider,
  DescuentosGlobales,
  DescuentoKilos
} from './../descuentos/descuentos';
import {Stock} from './../../models/productos.clases';
import {StockProvider} from './../stock/stock';
import {Cliente, CtaCte} from './../../models/clientes.clases';
import {AdicionalesProvider, Adicional} from './../adicionales/adicionales';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {
  Pedido,
  PedidoItem,
  calcularTotalFinal
} from './../../models/pedidos.clases';
import {DolarProvider} from './../dolar/dolar';
import {
  SUC_CONTADORES_ROOT,
  SUC_DOCUMENTOS_PEDIDOS,
  SUC_LOG_ROOT,
  SUC_STOCK_ROOT,
  SUC_DOCUMENTOS_CTASCTES_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';
import * as moment from 'moment';

@Injectable()
export class PedidosProvider {
  private adicionales: Adicional[];
  private descuentos: DescuentosGlobales;
  private usuario: Usuario;
  constructor(private db: AngularFireDatabase, private dolarP: DolarProvider,
              private adicionalesP: AdicionalesProvider,
              private descuentosP: DescuentosProvider,
              private stockP: StockProvider, private sucP: SucursalProvider,
              private usuarioP: UsuarioProvider,
              private ctacteP: CtasCtesProvider) {
    this.adicionalesP.getAdicionales().subscribe(
        (data) => { this.adicionales = data; });
    this.descuentosP.getDescuentos().subscribe(
        (ok) => { this.descuentos = ok; });
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }

  add(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let Nro: number = pedido.Numero;
      pedido.id = pedido.Numero;
      pedido.Creador = this.sucP.genUserDoc();
      let updData = {};
      updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = pedido;
      updData[`${SUC_CONTADORES_ROOT}Pedidos/`] = pedido.id;
      // log
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}Pedidos/Creados/${log.id}/`] = log;
      this.db.database.ref()
          .update(updData)
          .then((ok) => {
            obs.next(`Se guardo correctamete el pedido N: 00${Nro}`);
            obs.complete();
          })
          .catch((error) => {
            obs.error('Error de Conexion... No se pudo Guardar!');
            obs.complete();
          });
    });
  }

  update(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      pedido.Modificador = this.sucP.genUserDoc();
      let updData = {};
      updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = pedido;
      // log
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}Pedidos/Modificados/${log.id}/`] = log;
      this.db.database.ref()
          .update(updData)
          .then((ok) => {
            obs.next('Pedido actualizado correctamente!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`Error al intentes actualizar!... ERROR: ${error}`);
            obs.complete();
          });
    });
  }

  remove(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      if (pedido) {
        let updData = {};
        updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = {};
        // log
        let log = this.sucP.genLog(pedido);
        updData[`${SUC_LOG_ROOT}Pedidos/Eliminados/${log.id}/`] = log;
        this.db.database.ref()
            .update(updData)
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

  prepararPedido(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      if (pedido && pedido.Items) {
        pedido.Modificador = this.sucP.genUserDoc();
        pedido.TotalUnidades = this.calTotalUnidades(pedido.Items);
        pedido.TotalUs = this.calTotalU$(pedido);
        pedido.DescuentoKilos = this.calDescuentoKilos(pedido);
        let setData = (estado: boolean) => {
          pedido.isPreparado = estado;
          pedido.Items.forEach((item) => { item.isStockActualizado = estado; });
        };
        setData(true);
        let updData = {};
        updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = pedido;
        // log
        let log = this.sucP.genLog(pedido);
        updData[`${SUC_LOG_ROOT}Pedidos/Modificados/${log.id}/`] = log;
        let loop = (idx: number) => {
          let stkItem: Stock = new Stock(pedido.Items[idx].Perfil.id,
                                         pedido.Items[idx].Color.id);
          this.stockP.getStock(stkItem).subscribe(
              (stk) => {
                let logstk = this.sucP.genLog(stk);
                updData
                    [`${SUC_LOG_ROOT}Stock/Modificados/${stkItem.idPerfil}/${stkItem.idColor}/${logstk.id}/`] =
                        logstk;
                updData
                    [`${SUC_STOCK_ROOT}${stkItem.idPerfil}/${stkItem.idColor}/Stock/`] =
                        stk * 1 - pedido.Items[idx].Cantidad * 1;
                idx++;
                if (idx < pedido.Items.length) {
                  loop(idx);
                } else {
                  this.db.database.ref()
                      .update(updData)
                      .then((ok) => {
                        obs.next('Stock Actualizado Correctamente!');
                        obs.complete();
                      })
                      .catch((error) => {
                        setData(false);
                        obs.error(
                            'Error al intentar Actualizar el Stock, No se realizaron cambios!');
                        obs.complete();
                      });
                }
              },
              (stkError) => {
                obs.error('Error al consultar el Stock!');
                setData(false);
                obs.complete();
              });
        };
        loop(0);
      } else {
        obs.error('Faltan Datos');
        obs.complete();
      }
    });
  }

  entregarPedido(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      pedido.isEntregado = true;
      pedido.FechaEntrega = moment().format(FECHA);
      // Editor
      pedido.Modificador = this.sucP.genUserDoc();
      let updData = {};
      updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = pedido;
      // log pedidos
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}Pedidos/Modificados/${log.id}/`] = log;
      this.ctacteP.getSaldoCliente(pedido.idCliente)
          .subscribe(
              (saldo) => {
                let cta: CtaCte = new CtaCte();
                cta.Fecha = moment().format(FECHA);
                cta.Creador = this.sucP.genUserDoc();
                cta.TipoDocumento = 'Pedido';
                cta.Numero = pedido.id;
                cta.Debe = calcularTotalFinal(pedido);
                cta.Haber = 0;
                cta.Saldo = saldo + cta.Debe - cta.Haber;
                updData
                    [`${SUC_DOCUMENTOS_CTASCTES_ROOT}${pedido.idCliente}/${cta.TipoDocumento}${cta.Numero}/`] =
                        cta;
                this.db.database.ref()
                    .update(updData)
                    .then(() => {
                      obs.next(
                          'Pedido cerrado y Cta. Cte. Acualizada correctamente!');
                      obs.complete();
                    })
                    .catch((error) => {
                      obs.error(`No se pudo cerrar el Pedido! Error:${error}`);
                      obs.complete();
                    });



              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
    });
  }

  getAllCliente(idCliente: number): Observable<Pedido[]> {
    return new Observable((obs) => {
      if (SUC_DOCUMENTOS_PEDIDOS) {
        this.db.list(`${SUC_DOCUMENTOS_PEDIDOS}`,
                     {query: {orderByChild: 'idCliente', equalTo: idCliente}})
            .subscribe((data: Pedido[]) => { obs.next(data); }, (error) => {
              obs.error(error);
              console.error(error);
            });
      } else {
        obs.error('Sin sucursal');
        obs.complete();
      }
    });
  }

  getPendientesEmbalar(emablados: boolean): Observable<Pedido[]> {
    return new Observable((obs) => {
      if (SUC_DOCUMENTOS_PEDIDOS) {
        this.db.list(SUC_DOCUMENTOS_PEDIDOS,
                     {query: {orderByChild: 'isPreparado', equalTo: emablados}})
            .subscribe(
                (data: Pedido[]) => {
                  if (data) {
                    obs.next(data);
                  } else {
                    obs.next([]);
                  }
                },
                (error) => {
                  obs.error(error);
                  console.error(error);
                });
      } else {
        obs.error('Sin Sucursal');
        console.error('No Logeado!');
      }
    });
  }

  getPendientesEntregar(): Observable<Pedido[]> {
    return new Observable((obs) => {
      this.getPendientesEmbalar(true).subscribe((pedidos: Pedido[]) => {
        if (pedidos) {
          obs.next(pedidos.filter(
              (pedido) => { return (pedido.isEntregado === false); }));
        } else {
          obs.next([]);
        }
      }, (error) => { obs.error(error); });
    });
  }

  getOne(Nro: number): Observable<Pedido> {
    return new Observable((obs) => {
      this.db.object(`${SUC_DOCUMENTOS_PEDIDOS}${Nro}`)
          .subscribe((data: Pedido) => { obs.next(data); }, (error) => {
            obs.error(error);
            console.error(error);
          });
    });
  }

  getItemsPedido(Nro: number): Observable<PedidoItem[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_DOCUMENTOS_PEDIDOS}${Nro}/Items`)
          .subscribe((data: PedidoItem[]) => { obs.next(data); }, (error) => {
            obs.error(error);
            console.error(error);
          });
    });
  }

  calUnidades(i: PedidoItem): number {
    if (i) {
      if (i.Unidades > 0) {
        return i.Unidades;
      } else {
        let u: number = 0.00;
        let pxm: number =
            (i.Color.isPintura) ? i.Perfil.PesoPintado : i.Perfil.PesoNatural;
        u = i.Cantidad * (pxm * (i.Perfil.Largo / 1000));
        i.Unidades = u * 1;
        return u;
      }
    } else {
      return 0;
    }
  }

  calPrecioU$(i: PedidoItem, cliente?: Cliente): number {
    let pUs: number = 0.00;
    if (i.PrecioUs > 0) {
      pUs = i.PrecioUs;
    } else {
      pUs = i.Color.PrecioUs * 1;
      let adLinea =
          this.adicionales.find((ad) => { return ad.id == i.Perfil.Linea.id; });
      let adPerfil =
          this.adicionales.find((ad) => { return ad.id == i.Perfil.id; });
      pUs = pUs + ((adLinea) ? adLinea.adicional * 1 : 0) +
            ((adPerfil) ? adPerfil.adicional * 1 : 0);
      if (cliente && cliente.Descuentos && cliente.Descuentos.length > 0) {
        let deLinea = cliente.Descuentos.find(
            (de) => { return de.id == i.Perfil.Linea.id; });
        let dePerfil =
            cliente.Descuentos.find((de) => { return de.id == i.Perfil.id; });
        let deColor =
            cliente.Descuentos.find((de) => { return de.id == i.Color.id; });
        let des: number = 0.00;
        des += (deLinea && deLinea.Descuento) ? (deLinea.Descuento / 100) : 0;
        des +=
            (dePerfil && dePerfil.Descuento) ? (dePerfil.Descuento / 100) : 0;
        des += (deColor && deColor.Descuento) ? (deColor.Descuento / 100) : 0;
        if (this.usuario && (des > (this.usuario.MaxDescuentoItem / 100))) {
          des = this.usuario.MaxDescuentoItem / 100;
        }
        des = (des < 0.15) ? des : 0;
        pUs = pUs / (1 + des);
      }
    }
    i.PrecioUs = pUs * 1;
    return pUs;
  }

  calSubTotalU$(i: PedidoItem, cliente?: Cliente): number {
    if (i) {
      if (i.Unidades > 0 && i.PrecioUs > 0) {
        return i.Unidades * i.PrecioUs;
      } else {
        return this.calUnidades(i) * this.calPrecioU$(i, cliente) * 1;
      }
    } else {
      return 0.00;
    }
  }

  calTotalU$(pedido: Pedido, cliente?: Cliente): number {
    let tUs: number = 0.00;
    if (pedido && pedido.Items) {
      pedido.Items.forEach(
          (i) => { tUs += this.calSubTotalU$(i, cliente) * 1; });
    }
    return tUs * 1;
  }

  calTotal$(pedido: Pedido, cliente: Cliente): Observable<number> {
    return new Observable((obs) => {
      let tUs: number = this.calTotalU$(pedido, cliente);
      pedido.DescuentoKilos = this.calDescuentoKilos(pedido);
      tUs = tUs / ((pedido.DescuentoKilos > 0) ?
                       (1 + (pedido.DescuentoKilos / 100)) :
                       1);
      if (pedido) {
        if (pedido.Dolar && pedido.Dolar.Valor && pedido.Dolar.Valor > 0) {
          obs.next(tUs * pedido.Dolar.Valor * 1);
          obs.complete();
        } else {
          this.dolarP.getDolarValor().subscribe(
              (vU$) => {
                obs.next(tUs * vU$);
                obs.complete();
              },
              (error) => {
                obs.error(error);
                obs.complete();
              });
        }
      } else {
        obs.error();
        obs.complete();
      }
    });
  }

  calTotalUnidades(items: PedidoItem[]): number {
    let tU: number = 0.00;
    if (items) {
      items.forEach((i) => { tU += this.calUnidades(i); });
    }
    return tU;
  }

  calTotalBarras(items: PedidoItem[]): number {
    let tB: number = 0.00;
    if (items) {
      items.forEach((i) => { tB += (i.Cantidad * 1); });
    }
    return <number>tB;
  }

  calDescuentoKilos(pedido: Pedido): number {
    let des: number = 0.00;
    if (this.descuentos && this.descuentos.Kilos) {
      this.descuentos.Kilos.forEach((dk: DescuentoKilos) => {
        if (pedido.TotalUnidades > dk.MinimoUnidades) {
          des += dk.Descuento * 1;
        }
      });
    }
    return des;
  }
}
