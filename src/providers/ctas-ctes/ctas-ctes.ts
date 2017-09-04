import { ClientesProvider } from './../clientes/clientes';
import { FECHA } from './../../models/comunes.clases';
import * as moment from 'moment';
import { EMBALADO, PEDIDO } from './../../models/pedidos.clases';
import { Documento } from './../../models/documentos.class';
import { CtaCte, Cliente } from './../../models/clientes.clases';
import {
  SUC_DOCUMENTOS_CTASCTES_ROOT,
  SucursalProvider
} from './../sucursal/sucursal';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
@Injectable()
export class CtasCtesProvider {
  constructor(private db: AngularFireDatabase, private sucP: SucursalProvider, private clientesP: ClientesProvider) {
  }

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

  getAll(): Observable<CtaCte[]> {
    return new Observable((obs) => {
      this.db.list(SUC_DOCUMENTOS_CTASCTES_ROOT).subscribe((snap:CtaCte[]) => {
        obs.next(snap || []);
      }, (error) => {
        obs.error(error);
      });
    });
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

  getAllConSaldoMayorQue(valor: number): Observable<ClienteConSaldo[]> {
    return new Observable((obs => {
      this.clientesP.getAll().subscribe((clientes) => {
        let cs:ClienteConSaldo[] = [];
        let loop = (idx:number)=>{
          this.getSaldoCliente(clientes[idx].id).subscribe((s)=>{
            if(s > valor){
              cs.push({Cliente:clientes[idx], saldo:s});
            }
            idx++;
            if(idx  < clientes.length){
              loop(idx);
            }else{
              obs.next(cs);
            }
          },(error)=>{
            obs.error(error);
          });
        };
       loop(0);
      }, (error) => { obs.error(error); });
    }));
  }
}


export class ClienteConSaldo {
  Cliente: Cliente;
  saldo: number;
}