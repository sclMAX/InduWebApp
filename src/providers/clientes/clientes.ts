import {AngularFireAuth} from 'angularfire2/auth';
import {Cliente} from './../../models/cliente.class';
import {Injectable} from '@angular/core';
import {
  FirebaseListObservable,
  AngularFireDatabase
} from 'angularfire2/database';

@Injectable()
export class ClientesProvider {
  Clientes: FirebaseListObservable<Cliente[]>;
  private dbBasePath:string ;
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
    this.dbBasePath = this.auth.auth.currentUser.uid
    this.Clientes = this.db.list(this.dbBasePath);
  }
}
