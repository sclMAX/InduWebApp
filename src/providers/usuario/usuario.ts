import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

import {USUARIOS} from '../../models/db-base-paths';
import {UserLogin, Usuario} from '../../models/user.class';

@Injectable()
export class UsuarioProvider {
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {}

  public getCurrentUser(): Observable<Usuario> {
    return new Observable(obs => {
      this.auth.authState.subscribe(
          (user) => {
            if (user.uid) {
              this.db.object(`${USUARIOS}${user.uid}`)
                  .subscribe(
                      (usuario: Usuario) => {
                        if (usuario.id && usuario.Sucursal) {
                          obs.next(usuario);
                        } else {
                          obs.error();
                        }
                        obs.complete();
                      },
                      (error) => {
                        obs.error();
                        obs.complete();
                      });
            } else {
              obs.error();
              obs.complete();
            }
          },
          (error) => {
            obs.error();
            obs.complete();
          });
    });
  }

  public login(user: UserLogin): Observable<string> {
    return new Observable(
        (obs) => {
            this.auth.auth.signInWithEmailAndPassword(user.email, user.password)
                .then(() => {
                  obs.next('Login Ok!');
                  obs.complete();
                })
                .catch((error) => {
                  obs.error(`Email y/o password incorrectos!`);
                  obs.complete();
                })});
  }

  public logOut() {
    return this.auth.auth.signOut();
  }
}
