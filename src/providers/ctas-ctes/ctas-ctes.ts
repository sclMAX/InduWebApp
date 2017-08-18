import {FECHA} from './../../models/comunes.clases';
import * as moment from 'moment';
import {EMBALADO, PEDIDO} from './../../models/pedidos.clases';
import {Documento} from './../../models/documentos.class';
import {CtaCte} from './../../models/clientes.clases';
import {
  SUC_DOCUMENTOS_CTASCTES_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class CtasCtesProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider) {
  }

  genDocUpdateData(updData, doc: Documento, isDebe: boolean) {
    let cta: CtaCte = new CtaCte();
    doc.isInCtaCte = true;
    cta.idCliente = doc.idCliente;
    cta.fecha = doc.fecha;
    cta.Creador = this.sucP.genUserDoc();
    cta.tipoDocumento = (doc.tipo == EMBALADO) ? PEDIDO : doc.tipo;
    cta.numero = doc.numero;
    cta.debe = (isDebe) ? doc.totalFinalUs : 0.00;
    cta.haber = (!isDebe) ? doc.totalFinalUs : 0.00;
    cta.saldo = cta.debe - cta.haber;
    updData[`${SUC_DOCUMENTOS_CTASCTES_ROOT}${doc
                .idCliente}/${cta.tipoDocumento}${cta.numero}/`] = cta;
  }

  getSaldoCliente(idCliente: number): Observable<number> {
    return new Observable((obs) => {
      this.getCtaCteCliente(idCliente).subscribe(
          (cta) => {
            let saldo: number = 0.00;
            cta.forEach((i) => {
              saldo += i.debe || 0 - i.haber || 0;
              i.saldo = saldo;
            });
            obs.next(saldo);
            obs.complete();
          },
          (error) => {
            obs.error(error);
            obs.complete();
          });
    });
  }

  getCtaCteCliente(idCliente: number): Observable<CtaCte[]> {
    return new Observable((obs) => {
      this.db.list(`${SUC_DOCUMENTOS_CTASCTES_ROOT}${idCliente}/`)
          .subscribe((snap) => {
            let cta: CtaCte[] = snap || [];
            cta = cta.sort((a, b) => {
              return moment(a.fecha, FECHA)
                  .diff(moment(b.fecha, FECHA), 'days');

            });
            let saldo: number = 0.00;
            cta.forEach((i) => {
              saldo += Number(i.debe) - Number(i.haber);
              i.saldo = saldo;
            });
            obs.next(cta);
          }, (error) => { obs.error(error); });
    });
  }
}
