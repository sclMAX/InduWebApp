import {
  PRODUCTOS_PERFILES,
  PRODUCTOS_LINEAS
} from './../../models/db-base-paths';
import {Observable} from 'rxjs/Observable';
import {Perfil, Linea} from './../../models/productos.clases';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';


@Injectable()
export class ProductosProvider {
  private Perfiles: Perfil[];
  private Lineas: Linea[];

  constructor(private db: AngularFireDatabase) {}

  getPerfiles(linea?: Linea): Observable<Perfil[]> {
    return new Observable((obs) => {
      if (this.Perfiles) {
        if (linea) {
          obs.next(this.Perfiles.filter(
              (perfil) => { return (perfil.Linea.id == linea.id); }));
        } else {
          obs.next(this.Perfiles);
        }
        obs.complete();
      } else {
        let list = this.db.list(PRODUCTOS_PERFILES, {query: {orderByKey: true}})
                       .subscribe(
                           (data: Perfil[]) => {
                             this.Perfiles = data;
                             if (linea) {
                               obs.next(this.Perfiles.filter((perfil) => {
                                 return (perfil.Linea.id == linea.id);
                               }));
                             } else {
                               obs.next(this.Perfiles);
                             }
                             list.unsubscribe();
                             obs.complete();
                           },
                           (error) => {
                             obs.error(error);
                             obs.complete();
                           });
      }
    });
  }

  getPerfil(id: string): Promise<Perfil> {
    return new Promise<Perfil>((res, rej) => {
      this.getPerfiles()
          .map(perfiles => perfiles.find(p => p.id == id))
          .subscribe(p => res(p), err => rej(err));
    });
  }

  getLineas(): Observable<Linea[]> {
    return new Observable((obs) => {
      if (this.Lineas) {
        obs.next(this.Lineas);
        obs.complete();
      } else {
        let list = this.db.list(PRODUCTOS_LINEAS)
                       .subscribe(
                           (data: Linea[]) => {
                             this.Lineas = data;
                             obs.next(this.Lineas);
                             list.unsubscribe();
                             obs.complete();
                           },
                           (error) => {
                             obs.error(error);
                             obs.complete();
                           });
      }
    });
  }
}
