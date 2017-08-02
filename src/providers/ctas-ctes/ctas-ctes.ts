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
      let obj = this.db.object(`${SUC_DOCUMENTOS_CTASCTES_ROOT}${idCliente}/`)
                    .subscribe(
                        (ctacte: CtaCte) => {
                          obs.next(ctacte.Saldo);
                          obj.unsubscribe();
                          obs.complete();
                        },
                        (error) => {
                          obs.error(error);
                          obj.unsubscribe();
                          obs.complete();
                        });
    });
  }
}
