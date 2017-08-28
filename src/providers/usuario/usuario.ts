import {COMUN_CV} from './../../models/db-base-paths';
import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {USUARIOS} from '../../models/db-base-paths';
import {UserLogin, Usuario} from '../../models/user.class';

@Injectable()
export class UsuarioProvider {
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {}

  getCurrentUser(): Observable<Usuario> {
    return new Observable(obs => {
      this.auth.authState.subscribe(
          (user) => {
            if (user && user.uid) {
              this.db.object(`${USUARIOS}${user.uid}`)
                  .subscribe(
                      (usuario: Usuario) => {
                        if (usuario.id && usuario.sucursal) {
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

  login(user: UserLogin): Observable<string> {
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

  logOut() { return this.auth.auth.signOut(); }

  getCV(): Observable<CV[]> {
    return new Observable((obs) => {
      let list = this.db.list(COMUN_CV).subscribe(
          (cv: CV[]) => {
            obs.next(cv || []);
            list.unsubscribe();
            obs.complete();
          },
          (error) => {
            obs.error(error);
            obs.complete();
          });
    });
  }
}

export class CV {
  tipo: string;
  monto: number = 0.00;
  iva: number = 21;
  cf: number = 0.00;
  sf: number = 0.00;
}