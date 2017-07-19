import {SucursalContadores} from './../../models/sucursal.clases';
import {SUC_DOCUMENTOS_ROOT, SUC_CONTADORES_ROOT} from './../sucursal/sucursal';
import {Documento} from './../../models/documentos.class';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class DocumentosProvider {
  private documentos: Documento[];
  constructor(private db: AngularFireDatabase) {}

  public getAll(): Observable<Documento[]> {
    return new Observable((obs) => {
      if (this.documentos) {
        obs.next(this.documentos);
        obs.complete();
      } else {
        this.db.list(SUC_DOCUMENTOS_ROOT)
            .subscribe(
                (data: Documento[]) => {
                  this.documentos = data || [];
                  obs.next(this.documentos);
                  obs.complete();
                },
                (error) => {
                  obs.error(error);
                  obs.complete();
                });
      }
    });
  }

  public getDocumentosCurrentNro(): Observable<number> {
    return new Observable((obs) => {
      this.db.object(SUC_CONTADORES_ROOT)
          .subscribe((cont: SucursalContadores) => {
            if (cont.Documentos >= 0) {
              obs.next(cont.Documentos + 1);
            } else {
              obs.error();
            }
          }, (error) => { obs.error(error); });
    });
  }

  public setDocumentosCurrentNro(nro: number): Observable<number> {
    return new Observable(
        (obs) => {this.db.database.ref(`${SUC_CONTADORES_ROOT}Documentos/`)
                      .set(nro)
                      .then((ok) => {
                        obs.next(nro);
                        obs.complete();
                      })
                      .catch((error) => {
                        obs.error(error);
                        obs.complete();
                      })});
  }
}

export interface SucursalContadores { Documentos: number; }