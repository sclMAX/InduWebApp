import {SUC_COLORES_ROOT} from './../sucursal/sucursal';
import {Color} from './../../models/productos.clases';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';

@Injectable()
export class ColoresProvider {
  colores: Color[];
  constructor(private db: AngularFireDatabase) {}

  public getAll(): Observable<Color[]> {
    return new Observable((obs) => {
      if (this.colores) {
        obs.next(this.colores);
        obs.complete();
      } else {
        let list = this.db.list(SUC_COLORES_ROOT)
                       .subscribe(
                           (data: Color[]) => {
                             this.colores = data || [];
                             obs.next(this.colores);
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

  public getOne(id: string): Observable<Color> {
    return new Observable((obs) => {
      if (this.colores) {
        obs.next(this.colores.find(
            (color) => {return ((color) && (color.id === id))}));
      } else {
        this.getAll().subscribe(
            (data: Color[]) => {
              obs.next(data.find(
                  (color) => {return ((color) && (color.id === id))}));
            },
            (error) => {
              obs.error();
              obs.complete();
            });
      }
    });
  }

  getColor(id: string): Promise<Color> {
    return new Promise<Color>((res, rej) => {
      this.getAll()
          .map(colores => colores.find(c => c.id == id))
          .subscribe(color => res(color), err => rej(err));
    });
  }
}
