import {currentSucursal, sucBasePath} from './../sucursal/sucursal';
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
  private dbPath: string;
  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {
    if (sucBasePath) {
      this.dbPath = `${sucBasePath}/Clientes`;
      console.log('Clientes Path:', this.dbPath);
      this.Clientes = this.db.list(this.dbPath);
    }
  }
}
