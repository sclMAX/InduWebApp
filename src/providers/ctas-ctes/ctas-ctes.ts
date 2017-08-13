import {CtaCte} from './../../models/clientes.clases';
import {SUC_DOCUMENTOS_CTASCTES_ROOT} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class CtasCtesProvider {
  constructor(private db: AngularFireDatabase) {}

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
          .subscribe((cta) => { obs.next(cta || []); },
                     (error) => { obs.error(error); });
    });
  }
}
