import {LogProvider} from './../log/log';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import * as moment from 'moment';
import {Observable} from 'rxjs/Observable';
import {Cliente} from './../../models/clientes.clases';
import {FECHA} from './../../models/comunes.clases';
import {
  Pedido,
  PedidoItem,
  PEDIDO,
  PRESUPUESTO,
  EMBALADO,
  ENREPARTO,
  ENTREGADO,
  PEDIDO_CANCELADO
} from './../../models/pedidos.clases';
import {Usuario} from './../../models/user.class';
import {Adicional, AdicionalesProvider} from './../adicionales/adicionales';
import {ContadoresProvider} from './../contadores/contadores';
import {CtasCtesProvider} from './../ctas-ctes/ctas-ctes';
import {
  DescuentoKilos,
  DescuentosGlobales,
  DescuentosProvider
} from './../descuentos/descuentos';
import {DolarProvider} from './../dolar/dolar';
import {StockProvider} from './../stock/stock';
import {
  SUC_DOCUMENTOS_PEDIDOS,
  SUC_DOCUMENTOS_ROOT,
  SUC_LOG_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';



@Injectable()
export class PedidosProvider {
  private adicionales: Adicional[];
  private descuentos: DescuentosGlobales;
  private usuario: Usuario;
  constructor(private db: AngularFireDatabase,
              private contadoresP: ContadoresProvider,
              private ctacteP: CtasCtesProvider, private dolarP: DolarProvider,
              private adicionalesP: AdicionalesProvider,
              private descuentosP: DescuentosProvider,
              private sucP: SucursalProvider, private stockP: StockProvider,
              private logP: LogProvider) {
    this.adicionalesP.getAdicionales().subscribe(
        (data) => { this.adicionales = data; });
    this.descuentosP.getDescuentos().subscribe(
        (ok) => { this.descuentos = ok; });
    this.usuario = this.sucP.getUsuario();
  }

  genUpdateData(updData, pedido: Pedido, tipo, valor?) {
    updData[`${SUC_DOCUMENTOS_ROOT}${tipo}/${pedido.id}/`] =
        (valor) ? valor : pedido;
  }

  add(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let Nro: number = pedido.numero;
      pedido.id = pedido.numero;
      pedido.Creador = this.sucP.genUserDoc();
      let updData = {};
      // Add Pedido
      this.genUpdateData(updData, pedido, pedido.tipo);
      // Set Contador
      this.contadoresP.genPedidosUpdateData(updData, Nro, PRESUPUESTO);
      // log
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}${pedido.tipo}/Creados/${log.id}/`] = log;
      this.db.database.ref()
          .update(updData)
          .then((ok) => {
            obs.next(`Se guardo correctamete el ${pedido.tipo} N: 00${Nro}`);
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
      // Set Pedido
      this.genUpdateData(updData, pedido, pedido.tipo);
      // log
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}Pedidos/Modificados/${log.id}/`] = log;
      // Actualizar
      this.db.database.ref()
          .update(updData)
          .then((ok) => {
            obs.next(`${pedido.tipo} Actualizado correctamente!`);
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
      let updData = {};
      // Set Pedido to Null
      this.genUpdateData(updData, pedido, pedido.tipo, {});
      // log
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}Pedidos/Eliminados/${log.id}/`] = log;
      // Actualizar
      this.db.database.ref()
          .update(updData)
          .then((ok) => {
            obs.next(`${pedido.tipo} Eliminado!`);
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo Eliminar el ${pedido.tipo}`);
            obs.complete();
          });
    });
  }

  removeEmbalado(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Set a Null
      this.genUpdateData(updData, pedido, pedido.tipo, {});
      // Actualizar stock
      pedido.Items.forEach((i)=>{
        i.isStockActualizado = false;
      });
      this.stockP.genMultiUpdadeData(updData, pedido.Items, true)
          .subscribe(
              (data) => {
                updData = data;
                // Mover a Cancelados
                pedido.tipo = PEDIDO_CANCELADO;
                this.genUpdateData(updData, pedido, PEDIDO_CANCELADO, pedido);
                // Actualizar Cta.Cte.
                if (pedido.isInCtaCte) {
                  this.ctacteP.genDocUpdateData(updData, pedido, false);
                }
                // log
                this.logP.genPedidoUpdateData(updData, pedido, 'Cancelado');
                // Ejecutar peticion
                this.db.database.ref()
                    .update(updData)
                    .then(() => {
                      obs.next('Pedido Eliminado!');
                      obs.complete();
                    })
                    .catch((error) => {
                      obs.error(
                          `No se pudo Eliminar el Pedido! Error:${error}`);
                      obs.complete();
                    });

              },
              (error) => {
                obs.error(`No se pudo Eliminar el Pedido! Error:${error}`);
                obs.complete();
              });
    });
  }

  confirmarPresupuesto(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Set Tipo
      pedido.tipo = PEDIDO;
      // Set Modificador
      pedido.Modificador = this.sucP.genUserDoc();
      // Borrar Presuspueto
      this.genUpdateData(updData, pedido, PRESUPUESTO, {});
      // Add Pedido
      this.genUpdateData(updData, pedido, PEDIDO);
      // Log
      let log = this.sucP.genLog(pedido);
      updData[`${SUC_LOG_ROOT}${PRESUPUESTO}/Eliminado/${log.id}/`] = log;
      updData[`${SUC_LOG_ROOT}${PEDIDO}/Creado/${log.id}/`] = log;
      // Ejecutar peticion
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next(
                `Presupuesto ${pedido.id} Confirmado a Pedido ${pedido.id}!`);
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo confirmar el Presupuesto!...Error:${error}`);
            obs.complete();
          });
    });
  }

  setEmbalado(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Set Tipo
      pedido.tipo = EMBALADO;
      // Set Modificador
      pedido.Modificador = this.sucP.genUserDoc();
      // Eliminar el Pedido
      this.genUpdateData(updData, pedido, PEDIDO, {});
      // Add Pedido a Embalados
      this.genUpdateData(updData, pedido, EMBALADO);
      // Generar Actualizacion Multiple de Stock
      this.stockP.genMultiUpdadeData(updData, pedido.Items, false)
          .subscribe(
              (data) => {
                updData = data;
                // Ejecutar peticion
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

  setEntregado(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let updData = {};
      // Set Fecha de Entrega
      pedido.fechaEntrega = moment().format(FECHA);
      // Set Modificador
      pedido.Modificador = this.sucP.genUserDoc();
      // Set Cta. Cte. si no esta
      if (!pedido.isInCtaCte) {
        this.ctacteP.genDocUpdateData(updData, pedido, true);
      }
      // Eliminar de Embalados
      this.genUpdateData(updData, pedido, pedido.tipo, {});
      // Set Entregado
      pedido.tipo = ENTREGADO;
      this.genUpdateData(updData, pedido, ENTREGADO);
      // Ejecutar peticion
      this.db.database.ref()
          .update(updData)
          .then(() => {
            obs.next('Entrega Confirmada!');
            obs.complete();
          })
          .catch((error) => {
            obs.error(`No se pudo Confirmar la Entrega! Error:${error}`);
            obs.complete();
          });
    });
  }

  getAll(tipo: string): Observable<Pedido[]> {
    return this.db.list(`${SUC_DOCUMENTOS_ROOT}${tipo}/`);
  }

  getAllCliente(idCliente: number, tipo: string): Observable<Pedido[]> {
    return this.db.list(
        `${SUC_DOCUMENTOS_ROOT}${tipo}/`,
        {query: {orderByChild: 'idCliente', equalTo: idCliente}});
  }

  isDocsCliente(idCliente): Observable<boolean> {
    return new Observable((obs) => {
      let q = {orderByChild: 'idCliente', equalTo: idCliente};
      let ok = () => {
        obs.next(true);
        obs.complete();
      };
      let er = (error) => {
        obs.error(error);
        obs.complete();
      };
      this.db.list(`${SUC_DOCUMENTOS_ROOT}${PRESUPUESTO}/`, {query: q})
          .subscribe((snap) => {
            if (snap && snap.length > 0) {
              ok();
            } else {
              this.db.list(`${SUC_DOCUMENTOS_ROOT}${PEDIDO}/`, {query: q})
                  .subscribe((snap) => {
                    if (snap && snap.length > 0) {
                      ok();
                    } else {
                      this.db.list(`${SUC_DOCUMENTOS_ROOT}${EMBALADO}/`,
                                   {query: q})
                          .subscribe((snap) => {
                            if (snap && snap.length > 0) {
                              ok();
                            } else {
                              this.db.list(`${SUC_DOCUMENTOS_ROOT
                                                  }${ENREPARTO}/`,
                                           {query: q})
                                  .subscribe((snap) => {
                                    if (snap && snap.length > 0) {
                                      ok();
                                    } else {
                                      this.db.list(`${SUC_DOCUMENTOS_ROOT
                                                              }${ENTREGADO}/`,
                                                   {query: q})
                                          .subscribe((snap) => {
                                            if (snap && snap.length > 0) {
                                              ok();
                                            } else {
                                              obs.next(false);
                                              obs.complete();
                                            }
                                          }, (error) => { er(error); });
                                    }
                                  }, (error) => { er(error); });
                            }
                          }, (error) => { er(error); });
                    }
                  }, (error) => { er(error); });
            }
          }, (error) => { er(error); });
    });
  }

  getOne(tipo: string, Nro: number): Observable<Pedido> {
    return new Observable((obs) => {
      this.db.object(`${SUC_DOCUMENTOS_ROOT}${tipo}/${Nro}`)
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
      if (i.unidades > 0) {
        return i.unidades;
      } else {
        let u: number = 0.00;
        let pxm: number =
            (i.Color.isPintura) ? i.Perfil.pesoPintado : i.Perfil.pesoNatural;
        u = i.cantidad * (pxm * (i.Perfil.largo / 1000));
        i.unidades = u * 1;
        return u;
      }
    } else {
      return 0;
    }
  }

  calPrecioU$(i: PedidoItem, cliente?: Cliente): number {
    let pUs: number = 0.00;
    if (i.precioUs > 0) {
      pUs = i.precioUs;
    } else {
      pUs = i.Color.precioUs * 1;
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
        des += (deLinea && deLinea.descuento) ? (deLinea.descuento / 100) : 0;
        des +=
            (dePerfil && dePerfil.descuento) ? (dePerfil.descuento / 100) : 0;
        des += (deColor && deColor.descuento) ? (deColor.descuento / 100) : 0;
        if (this.usuario && (des > (this.usuario.maxDescuentoItem / 100))) {
          des = this.usuario.maxDescuentoItem / 100;
        }
        des = (des < 0.15) ? des : 0;
        pUs = pUs / (1 + des);
      }
    }
    i.precioUs = pUs * 1;
    return pUs;
  }

  calSubTotalU$(i: PedidoItem, cliente?: Cliente): number {
    if (i) {
      if (i.unidades > 0 && i.precioUs > 0) {
        return i.unidades * i.precioUs;
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
      pedido.descuentoKilos = this.calDescuentoKilos(pedido);
      tUs = tUs / ((pedido.descuentoKilos > 0) ?
                       (1 + (pedido.descuentoKilos / 100)) :
                       1);
      if (pedido) {
        if (pedido.Dolar && pedido.Dolar.valor && pedido.Dolar.valor > 0) {
          obs.next(tUs * pedido.Dolar.valor * 1);
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
      items.forEach((i) => { tB += (i.cantidad * 1); });
    }
    return tB;
  }

  calDescuentoKilos(pedido: Pedido): number {
    let des: number = 0.00;
    if (this.descuentos && this.descuentos.Kilos) {
      this.descuentos.Kilos.forEach((dk: DescuentoKilos) => {
        if (pedido.totalUnidades > dk.minimoUnidades) {
          des += dk.descuento * 1;
        }
      });
    }
    return des;
  }
}
