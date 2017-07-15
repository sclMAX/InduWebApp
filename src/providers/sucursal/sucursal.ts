import {Injectable} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {ROOT} from '../../models/db-base-paths';
import {UsuarioProvider} from '../usuario/usuario';
import {UserLogin, Usuario} from './../../models/user.class';

export let SUCURSAL: string = '';
export let SUCURSAL_ROOT: string = '';
export let CLIENTES_ROOT: string = '';

@Injectable()
export class SucursalProvider {
  constructor(
      private db: AngularFireDatabase, private usuarioP: UsuarioProvider) {}

  public setSucursal(): Observable<string> {
    return new Observable((obs) => {
      this.usuarioP.getCurrentUser().subscribe(
          (usuario) => {
            this.setPaths(usuario.Sucursal);
            obs.next(SUCURSAL);
            obs.complete();
          },
          (error) => {
            obs.error();
            obs.complete();
          });

    });
  }

  /*
  * Seteo de Rutas base para toda la App
  * Agregar nodos hijos de la sucursal
  */
  private setPaths(sucursal: string) {
    SUCURSAL = sucursal;
    SUCURSAL_ROOT = `${ROOT}${SUCURSAL}/`;
    CLIENTES_ROOT = `${SUCURSAL_ROOT}Clientes/`;
  }
}
