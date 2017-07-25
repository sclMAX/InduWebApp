import {SUC_ADICIONALES_ROOT} from './../sucursal/sucursal';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
@Injectable()
export class AdicionalesProvider {
  private adicionales: Adicional[];
  constructor(private db: AngularFireDatabase) {}

  getAdicionales(): Observable<Adicional[]> {
    return new Observable((obs) => {
      this.db.list(SUC_ADICIONALES_ROOT)
          .subscribe((data: Adicional[]) => {
            this.adicionales = data;
            obs.next(this.adicionales);
          }, (error) => { obs.error(error); });
    });
  }
}

export class Adicional {
  id: string;
  adicional: number;
}
