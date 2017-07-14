import {DBVERSION} from './../../models/dbGlobalVars';
import {Observable} from 'rxjs/Observable';
import {User} from './../../models/user.class';
import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from 'angularfire2/auth';

export let currentSucursal: string = '';
export let sucBasePath: string = '';

@Injectable()
export class SucursalProvider {
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {}

  getSucursal(): Observable<string> {
    return new Observable(
        obs => {this.auth.authState.subscribe(user => {
          if (user) {
            this.db.object(`${DBVERSION}/Usuarios/${user.uid}`)
                .subscribe(sucursales => {
                  currentSucursal = sucursales.Sucursal || '';
                  if (currentSucursal) {
                    sucBasePath = `${DBVERSION}/Sucursales/${currentSucursal}`;
                    obs.next(currentSucursal);
                    obs.complete();
                  }else{
                    obs.error('No tienes asignada ninguna Sucursal!');
                    obs.complete();
                  }
                  
                }, error => { obs.error(error); });
          } else {
            obs.error('');
          }
        },error=>{
          obs.error('Sin Conexion!');
        })});
  }

  login(usuario: User) {}
}
