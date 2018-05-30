import {ClientesProvider} from './../clientes/clientes';
import {FECHA} from './../../models/comunes.clases';
import * as moment from 'moment';
import {EMBALADO, PEDIDO} from './../../models/pedidos.clases';
import {Documento, NotaDebito} from './../../models/documentos.class';
import {CtaCte, Cliente} from './../../models/clientes.clases';
import {
  SUC_DOCUMENTOS_CTASCTES_ROOT,
  SucursalProvider,
  SUC_DOCUMENTOS_ROOT
} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class CtasCtesProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider,
              private clientesP: ClientesProvider) {}

  genDocUpdateData(updData, doc: Documento, isDebe: boolean) {
    let cta: CtaCte = new CtaCte();
    doc.isInCtaCte = true;
    cta.idCliente = doc.idCliente;
    cta.fecha = doc.fechaEntrega;
    cta.Creador = this.sucP.genUserDoc();
    cta.tipoDocumento = (doc.tipo == EMBALADO) ? PEDIDO : doc.tipo;
    cta.numero = doc.numero;
    cta.debe = (isDebe) ? doc.totalFinalUs : 0.00;
    cta.haber = (!isDebe) ? doc.totalFinalUs : 0.00;
    cta.saldo = cta.debe - cta.haber;
    updData[`${SUC_DOCUMENTOS_CTASCTES_ROOT}${doc
      .idCliente}/${cta.tipoDocumento}${cta.numero}/`] = cta;
  }

  genRemoveDocUpdateData(updData, doc: Documento) {
    updData[`${SUC_DOCUMENTOS_CTASCTES_ROOT}${doc
      .idCliente}/${(doc.tipo == EMBALADO) ? PEDIDO : doc.tipo}${doc.numero}/`] =
        {};
  }

  genNotaDebitoUpdateData(updData, id, valor) {
    updData[`${SUC_DOCUMENTOS_ROOT}NotaDebito/${id}/`] = valor;
  }

  getNotaDebito(id:number):Observable<NotaDebito>{
    return this.db.object(`${SUC_DOCUMENTOS_ROOT}NotaDebito/${id}/`).map((snap:NotaDebito)=>snap);
  }

  addNotaDebito(nd: NotaDebito): Observable<string> {
    return new Observable((obs) => { nd.Creador = this.sucP.genUserDoc(); });
  }
  getSaldoCliente(idCliente: number): Observable<number> {
    return this.getCtaCteCliente(idCliente).map((cta) => {
      let saldo: number = 0.00;
      if (cta && cta.length > 0) {
        saldo = cta[cta.length - 1].saldo;
      }
      return saldo;
    });
  }

  getCtaCteCliente(idCliente: number): Observable<CtaCte[]> {
    return this.db.list(`${SUC_DOCUMENTOS_CTASCTES_ROOT}${idCliente}/`)
        .map((snap) => {
          let cta: CtaCte[] = snap || [];
          cta = cta.sort((a, b) => {
            return moment(a.fecha, FECHA).diff(moment(b.fecha, FECHA), 'days');
          });
          let saldo: number = 0.00;
          cta.forEach((i) => {
            saldo += Number(i.debe) - Number(i.haber);
            i.saldo = saldo;
          });
          return cta;
        });
  }

  getAllConSaldoMayorQue(valor: number): Observable<ClienteConSaldo[]> {
    return new Observable((obs => {
      this.clientesP.getAll().subscribe((clientes) => {
        let cs: ClienteConSaldo[] = [];
        clientes.forEach(async c => {
          this.getSaldoCliente(c.id).subscribe((s) => {
            if (((valor > 0)&&(s > valor))||((valor < 0)&&(s < valor))) {
              let exist = cs.find((i) => { return i.Cliente.id == c.id; });
              if (exist) {
                exist.saldo = s;
              } else {
                cs.push({Cliente: c, saldo: s});
              }
            } else {
              let idx = cs.findIndex((i) => { return i.Cliente.id == c.id; });
              if (idx > -1) {
                cs.splice(idx, 1);
              }
            }
          });
        });
        obs.next(cs);
      }, (error) => { obs.error(error); });
    }));
  }
}


export class ClienteConSaldo {
  Cliente: Cliente;
  saldo: number;
}