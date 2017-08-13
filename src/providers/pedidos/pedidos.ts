import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import * as moment from 'moment';
import {Observable} from 'rxjs/Observable';
import {Cliente, CtaCte} from './../../models/clientes.clases';
import {FECHA} from './../../models/comunes.clases';
import {calcularTotalFinal, Pedido, PedidoItem} from './../../models/pedidos.clases';
import {Usuario} from './../../models/user.class';
import {Adicional, AdicionalesProvider} from './../adicionales/adicionales';
import {ContadoresProvider} from './../contadores/contadores';
import {CtasCtesProvider} from './../ctas-ctes/ctas-ctes';
import {DescuentoKilos, DescuentosGlobales, DescuentosProvider} from './../descuentos/descuentos';
import {DolarProvider} from './../dolar/dolar';
import {StockProvider} from './../stock/stock';
import {SUC_DOCUMENTOS_CTASCTES_ROOT, SUC_DOCUMENTOS_PEDIDOS, SUC_DOCUMENTOS_ROOT, SUC_LOG_ROOT, SucursalProvider} from './../sucursal/sucursal';
import {UsuarioProvider} from './../usuario/usuario';

export const PRESUPUESTO: string = 'Presupuesto';
export const PEDIDO: string = 'Pedido';
export const EMBALADO: string = 'Embalado';
export const ENREPARTO: string = 'En Reparto';
export const ENTREGADOS: string = 'Entregado';

@Injectable()
export class PedidosProvider {
  private adicionales: Adicional[];
  private descuentos: DescuentosGlobales;
  private usuario: Usuario;
  constructor(
      private db: AngularFireDatabase, private contadoresP: ContadoresProvider,
      private dolarP: DolarProvider, private adicionalesP: AdicionalesProvider,
      private descuentosP: DescuentosProvider, private sucP: SucursalProvider,
      private usuarioP: UsuarioProvider, private ctacteP: CtasCtesProvider,
      private stockP: StockProvider) {
    this.adicionalesP.getAdicionales().subscribe((data) => {
      this.adicionales = data;
    });
    this.descuentosP.getDescuentos().subscribe((ok) => {
      this.descuentos = ok;
    });
    this.usuarioP.getCurrentUser().subscribe((user) => {
      this.usuario = user;
    });
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
      // Set Item stkActualizado a true
      pedido.Items.forEach((i) => {
        i.isStockActualizado = true;
      });
      // Add Pedido a Embalados
      this.genUpdateData(updData, pedido, EMBALADO);
      // Actualizar Stock y Ejecutar peticion
      let loop = (idx) => {
        // Busca el stock actual
        this.stockP
            .getStock(pedido.Items[idx].Perfil.id, pedido.Items[idx].Color.id)
            .subscribe(
                (stk) => {
                  // Calcula nuevo stock
                  let newStk: number = stk * 1 - pedido.Items[idx].cantidad * 1;
                  // Generar UpdateData
                  this.stockP.genUpdateData(
                      updData, pedido.Items[idx].Perfil.id,
                      pedido.Items[idx].Color.id, newStk);
                  idx++;
                  // Si quedan items busca el siguiente
                  if (idx < pedido.Items.length) {
                    loop(idx);
                  } else {  // si no
                    // Ejecutar peticion
                    this.db.database.ref()
                        .update(updData)
                        .then(() => {
                          obs.next('Stock Actualizado correctamete!');
                          obs.complete();
                        })
                        .catch((error) => {
                          obs.error(
                              `No se pudo Actualizar el Stock! Error: ${error
                              }`);
                          obs.complete()
                        });
                  }
                },
                (error) => {
                  obs.error(`No se pudo Actualizar el Stock! Error: ${error}`);
                  obs.complete();
                });
      };
      loop(0);
    });
  }

  entregarPedido(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      pedido.fechaEntrega = moment().format(FECHA);
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
                cta.fecha = moment().format(FECHA);
                cta.Creador = this.sucP.genUserDoc();
                cta.tipoDocumento = 'Pedido';
                cta.numero = pedido.id;
                cta.debe = calcularTotalFinal(pedido);
                cta.haber = 0;
                cta.saldo = saldo + cta.debe - cta.haber;
                updData[`${SUC_DOCUMENTOS_CTASCTES_ROOT}${pedido
                            .idCliente}/${cta.tipoDocumento}${cta.numero}/`] =
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

  getAll(tipo: string = PEDIDO, realtime: boolean = true):
      Observable<Pedido[]> {
    return new Observable((obs) => {
      let fin = () => {
        (realtime) ? null : obs.complete();
      };
      this.db.list(`${SUC_DOCUMENTOS_ROOT}${tipo}/`)
          .subscribe(
              (snap) => {
                obs.next(snap || []);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
  }

  getAllCliente(idCliente: number, tipo: string, realtime: boolean = true):
      Observable<Pedido[]> {
    return new Observable((obs) => {
      let fin = () => {
        (realtime) ? null : obs.complete();
      };
      this.db
          .list(
              `${SUC_DOCUMENTOS_ROOT}${tipo}/`,
              {query: {orderByChild: 'idCliente', equalTo: idCliente}})
          .subscribe(
              (snap) => {
                obs.next(snap || []);
                fin();
              },
              (error) => {
                obs.error(error);
                fin();
              });
    });
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
          .subscribe(
              (snap) => {
                if (snap && snap.length > 0) {
                  ok();
                } else {
                  this.db.list(`${SUC_DOCUMENTOS_ROOT}${PEDIDO}/`, {query: q})
                      .subscribe(
                          (snap) => {
                            if (snap && snap.length > 0) {
                              ok();
                            } else {
                              this.db
                                  .list(
                                      `${SUC_DOCUMENTOS_ROOT}${EMBALADO}/`,
                                      {query: q})
                                  .subscribe(
                                      (snap) => {
                                        if (snap && snap.length > 0) {
                                          ok();
                                        } else {
                                          this.db
                                              .list(
                                                  `${SUC_DOCUMENTOS_ROOT
                                                  }${ENREPARTO}/`,
                                                  {query: q})
                                              .subscribe(
                                                  (snap) => {
                                                    if (snap &&
                                                        snap.length > 0) {
                                                      ok();
                                                    } else {
                                                      this.db
                                                          .list(
                                                              `${SUC_DOCUMENTOS_ROOT
                                                              }${ENTREGADOS}/`,
                                                              {query: q})
                                                          .subscribe(
                                                              (snap) => {
                                                                if (snap &&
                                                                    snap.length >
                                                                        0) {
                                                                  ok();
                                                                } else {
                                                                  obs.next(
                                                                      false);
                                                                  obs.complete();
                                                                }
                                                              },
                                                              (error) => {
                                                                er(error);
                                                              });
                                                    }
                                                  },
                                                  (error) => {
                                                    er(error);
                                                  });
                                        }
                                      },
                                      (error) => {
                                        er(error);
                                      });
                            }
                          },
                          (error) => {
                            er(error);
                          });
                }
              },
              (error) => {
                er(error);
              });
    });
  }

  getPendientesEmbalar(emablados: boolean): Observable<Pedido[]> {
    return new Observable((obs) => {
      if (SUC_DOCUMENTOS_PEDIDOS) {
        this.db
            .list(
                SUC_DOCUMENTOS_PEDIDOS,
                {query: {orderByChild: 'isPreparado', equalTo: emablados}})
            .subscribe(
                (data: Pedido[]) => {
                  if (data) {
                    obs.next(data);
                  } else {
                    '**/db/**'
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
      this.getPendientesEmbalar(true).subscribe(
          (pedidos: Pedido[]) => {
            if (pedidos) {
              obs.next(pedidos);
            } else {
              obs.next([]);
            }
          },
          (error) => {
            obs.error(error);
          });
    });
  }

  getOne(tipo: string = PEDIDO, Nro: number): Observable<Pedido> {
    return new Observable((obs) => {
      this.db.object(`${SUC_DOCUMENTOS_ROOT}${tipo}/${Nro}`)
          .subscribe(
              (data: Pedido) => {
                obs.next(data);
              },
              (error) => {
                obs.error(error);
                console.error(error);
              });
    });
  }

  getItemsPedido(Nro: number): Observable<PedidoItem[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_DOCUMENTOS_PEDIDOS}${Nro}/Items`)
          .subscribe(
              (data: PedidoItem[]) => {
                obs.next(data);
              },
              (error) => {
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
      let adLinea = this.adicionales.find((ad) => {
        return ad.id == i.Perfil.Linea.id;
      });
      let adPerfil = this.adicionales.find((ad) => {
        return ad.id == i.Perfil.id;
      });
      pUs = pUs + ((adLinea) ? adLinea.adicional * 1 : 0) +
          ((adPerfil) ? adPerfil.adicional * 1 : 0);
      if (cliente && cliente.Descuentos && cliente.Descuentos.length > 0) {
        let deLinea = cliente.Descuentos.find((de) => {
          return de.id == i.Perfil.Linea.id;
        });
        let dePerfil = cliente.Descuentos.find((de) => {
          return de.id == i.Perfil.id;
        });
        let deColor = cliente.Descuentos.find((de) => {
          return de.id == i.Color.id;
        });
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
      pedido.Items.forEach((i) => {
        tUs += this.calSubTotalU$(i, cliente) * 1;
      });
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
      items.forEach((i) => {
        tU += this.calUnidades(i);
      });
    }
    '**/db/**'
    return tU;
  }

  calTotalBarras(items: PedidoItem[]): number {
    let tB: number = 0.00;
    if (items) {
      items.forEach((i) => {
        tB += (i.cantidad * 1);
      });
      }
    return <number>tB;
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
