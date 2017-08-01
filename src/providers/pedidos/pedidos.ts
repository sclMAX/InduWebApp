import {
  DescuentosProvider,
  DescuentosGlobales,
  DescuentoKilos
} from './../descuentos/descuentos';
import {Stock} from './../../models/productos.clases';
import {StockProvider} from './../stock/stock';
import {UsuarioProvider} from './../usuario/usuario';
import {Usuario, UserDoc} from './../../models/user.class';
import {Cliente} from './../../models/clientes.clases';
import {AdicionalesProvider, Adicional} from './../adicionales/adicionales';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {Pedido, PedidoItem} from './../../models/pedidos.clases';
import {SucursalContadores} from './../../models/sucursal.clases';
import {DolarProvider} from './../dolar/dolar';
import {
  SUC_CONTADORES_ROOT,
  SUC_DOCUMENTOS_PEDIDOS,
  SUC_LOG_ROOT,
  SUC_STOCK_ROOT
} from './../sucursal/sucursal';

@Injectable()
export class PedidosProvider {
  private adicionales: Adicional[];
  private descuentos: DescuentosGlobales;
  private usuario: Usuario;
  constructor(private db: AngularFireDatabase, private dolarP: DolarProvider,
              private adicionalesP: AdicionalesProvider,
              private descuentosP: DescuentosProvider,
              private stockP: StockProvider,
              private usuarioP: UsuarioProvider) {
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
      if (!pedido.Creador) {
        pedido.Creador = new UserDoc();
      }
      pedido.Creador.Fecha = new Date().toISOString();
      pedido.Creador.Usuario = this.usuario;
      let updData = {};
      updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = pedido;
      updData[`${SUC_CONTADORES_ROOT}Pedidos/`] = pedido.id;
      updData[`${SUC_LOG_ROOT}Pedidos/Creados/${Date.now()}/`] = {
        Pedido: pedido,
        Usuario: this.usuario,
        Fecha: new Date().toISOString(),
        Comentario: 'Pedido Nuevo'
      };
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
      if (!pedido.Modificador) {
        pedido.Modificador = new UserDoc();
      }
      pedido.Modificador.Fecha = new Date().toISOString();
      pedido.Modificador.Usuario = this.usuario;
      let updData = {};
      updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}/`] = pedido;
      updData[`${SUC_LOG_ROOT}Pedidos/Modificados/${Date.now()}/`] = {
        Pedido: pedido,
        Usuario: this.usuario,
        Fecha: new Date().toISOString(),
        Comentario: 'Pedido Modificado'
      };
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
        updData[`${SUC_LOG_ROOT}Pedidos/Eliminados/${Date.now()}/`] = {
          Pedido: pedido,
          Usuario: this.usuario,
          Fecha: new Date().toISOString(),
          Comentario: 'Pedido Eliminado'
        };
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
        if (!pedido.Modificador) {
          pedido.Modificador = new UserDoc();
        }
        pedido.Modificador.Fecha = new Date().toISOString();
        pedido.Modificador.Usuario = this.usuario;
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
        updData[`${SUC_LOG_ROOT}Pedidos/Modificados/${Date.now()}/`] = {
          Pedido: pedido,
          Usuario: this.usuario,
          Fecha: new Date().toISOString(),
          Comentario: 'Pedido Preparado'
        };
        let loop = (idx: number) => {
          let stkItem: Stock = new Stock(pedido.Items[idx].Perfil.id,
                                         pedido.Items[idx].Color.id);
          this.stockP.getStock(stkItem).subscribe(
              (stk) => {
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

  getCurrentNro(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(SUC_CONTADORES_ROOT)
          .subscribe((contadores: SucursalContadores) => {
            if (contadores.Pedidos >= 0) {
              obs.next(contadores.Pedidos + 1);
            } else {
              obs.error();
            }
          }, (error) => { obs.error(error); });
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
