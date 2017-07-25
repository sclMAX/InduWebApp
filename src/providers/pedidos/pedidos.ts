import {UsuarioProvider} from './../usuario/usuario';
import {Usuario} from './../../models/user.class';
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
  SUC_DOCUMENTOS_PEDIDOS
} from './../sucursal/sucursal';

@Injectable()
export class PedidosProvider {
  private adicionales: Adicional[];
  private usuario: Usuario;
  constructor(private db: AngularFireDatabase, private dolarP: DolarProvider,
              private adicionalesP: AdicionalesProvider,
              private usuarioP: UsuarioProvider) {
    this.adicionalesP.getAdicionales().subscribe(
        (data) => { this.adicionales = data; });
    this.usuarioP.getCurrentUser().subscribe(
        (user) => { this.usuario = user; });
  }

  public getAllCliente(idCliente: number): Observable<Pedido[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_DOCUMENTOS_PEDIDOS}`,
                   {query: {orderByChild: 'idCliente', equalTo: idCliente}})
          .subscribe((data: Pedido[]) => { obs.next(data); },
                     (error) => { obs.error(error); });
    });
  }

  public getPendientesEmbalar(emablados: boolean): Observable<Pedido[]> {
    return new Observable((obs) => {
      this.db.list(SUC_DOCUMENTOS_PEDIDOS,
                   {query: {orderByChild: 'isPreparado', equalTo: emablados}})
          .subscribe((data: Pedido[]) => { obs.next(data); },
                     (error) => { obs.error(error); });
    });
  }

  public getPendientesEntregar(): Observable<Pedido[]> {
    return new Observable((obs) => {
      this.getPendientesEmbalar(true).subscribe((pedidos: Pedido[]) => {
        obs.next(pedidos.filter(
            (pedido) => { return (pedido.isEntregado === false); }));
      }, (error) => { obs.error(error); });
    });
  }

  public getOne(Nro: number): Observable<Pedido> {
    return new Observable((obs) => {
      this.db.object(`${SUC_DOCUMENTOS_PEDIDOS}${Nro}`)
          .subscribe((data: Pedido) => { obs.next(data); },
                     (error) => { obs.error(error); });
    });
  }

  public getItemsPedido(Nro: number): Observable<PedidoItem[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_DOCUMENTOS_PEDIDOS}${Nro}/Items`)
          .subscribe((data: PedidoItem[]) => { obs.next(data); },
                     (error) => { obs.error(error); });
    });
  }

  public add(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      let Nro: number = pedido.Numero;
      pedido.id = pedido.Numero;
      let updData = {};
      updData[`${SUC_DOCUMENTOS_PEDIDOS}${pedido.Numero}/`] = pedido;
      updData[`${SUC_CONTADORES_ROOT}Pedidos/`] = pedido.Numero;
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

  public update(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      this.db.object(`${SUC_DOCUMENTOS_PEDIDOS}${pedido.id}`)
          .update(pedido)
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

  public remove(pedido: Pedido): Observable<string> {
    return new Observable((obs) => {
      if (pedido) {
        this.db.database.ref(`${SUC_DOCUMENTOS_PEDIDOS}${pedido.Numero}`)
            .remove()
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

  public getCurrentNro(): Observable<number> {
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

  public calUnidades(i: PedidoItem): number {
    if (i) {
      if (i.Unidades > 0) {
        return i.Unidades;
      } else {
        let u: number = 0.00;
        let pxm: number =
            (i.Color.isPintura) ? i.Perfil.PesoPintado : i.Perfil.PesoNatural;
        u = i.Cantidad * (pxm * (i.Perfil.Largo / 1000));
        return u;
      }
    } else {
      return 0;
    }
  }

  public calPrecioU$(i: PedidoItem, cliente: Cliente): number {
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
    return pUs;
  }

  public calSubTotalU$(i: PedidoItem, cliente: Cliente): number {
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

  public calTotalU$(pedido: Pedido, cliente: Cliente): number {
    let tUs: number = 0.00;
    if (pedido && pedido.Items) {
      pedido.Items.forEach(
          (i) => { tUs += this.calSubTotalU$(i, cliente) * 1; });
    }
    return tUs * 1;
  }

  public calTotal$(pedido: Pedido, cliente: Cliente): Observable<number> {
    return new Observable((obs) => {
      let tUs: number = this.calTotalU$(pedido, cliente);
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

  public calTotalUnidades(items: PedidoItem[]): number {
    let tU: number = 0.00;
    if (items) {
      items.forEach((i) => { tU += this.calUnidades(i); });
    }
    return tU;
  }

  public calTotalBarras(items: PedidoItem[]): number {
    let tB: number = 0.00;
    if (items) {
      items.forEach((i) => { tB += (i.Cantidad * 1); });
    }
    return <number>tB;
  }
}
