import {Http, Response} from '@angular/http';
import {
  PRODUCTOS_PERFILES,
  PRODUCTOS_COLORES,
  PRODUCTOS_LINEAS
} from './../../models/db-base-paths';
import {Observable} from 'rxjs/Observable';
import {Perfil, Color, Linea} from './../../models/productos.clases';
import {AngularFireDatabase} from 'angularfire2/database';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';


@Injectable()
export class ProductosProvider {
  private Perfiles: Perfil[];
  private Colores: Color[];
  private Lineas: Linea[];

  constructor(private db: AngularFireDatabase, private http: Http) {}

  public getPerfiles(linea?: Linea): Observable<Perfil[]> {
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
        let list = this.db.list(PRODUCTOS_PERFILES,{query:{orderByKey:true}})
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

  public getColores(): Observable<Color[]> {
    return new Observable((obs) => {
      if (this.Colores) {
        obs.next(this.Colores);
        obs.complete();
      } else {
        let list = this.db.list(PRODUCTOS_COLORES)
                       .subscribe(
                           (data: Color[]) => {
                             this.Colores = data;
                             obs.next(this.Colores);
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

  public getLineas(): Observable<Linea[]> {
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

  private perfilesDownloadWeb() {
    this.http.get('http://www.indumatics.com.ar/api/perfiles/')
        .map((res: Response) => res.json())
        .subscribe((data) => {
          console.log(data.result);
          let Pweb: PerfilWeb[] = data.result;
          console.log('PWEB:', Pweb);
          this.loadToFirebase(0, Pweb);
        });
  }

  private loadToFirebase(idx, wp: PerfilWeb[]) {
    let p: Perfil = new Perfil();
    p.id = wp[idx].idPerfil;
    p.Codigo = p.id;
    p.Descripcion = wp[idx].descripcion;
    p.Largo = wp[idx].largo;
    p.BarrasPaquete = wp[idx].bxp;
    p.PesoMetro = wp[idx].pxm;
    p.Linea = new Linea();
    if (wp[idx].idLinea == 1) {
      p.Linea.id = "Tradicional";
      p.Linea.Nombre = "Tradicional";
      p.Linea.Descripcion = "Linea Tradicional (Herrero)";
    } else {
      p.Linea.id = "6000";
      p.Linea.Nombre = "6000";
      p.Linea.Descripcion = "Linea 6000 (Modena)";
    }
    console.log('Guardando...', p.id, " Item ", idx + 1 , ' de ', wp.length);
    this.db.database.ref(`${PRODUCTOS_PERFILES}${p.id}/`).set(p).then((ok)=>{
      console.log('Guardado:', p.id);
      if(idx < wp.length-1){
        idx = idx + 1;
        this.loadToFirebase(idx, wp);
      }
    });
  }
}

export interface PerfilWeb {
  idPerfil: string;
  descripcion: string;
  largo: number;
  pxm: number;
  bxp: number;
  idlinea: number;
  idLinea: number;
}