import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {Cliente} from './../../models/cliente.class';
import {sucBasePath} from './../sucursal/sucursal';

@Injectable()
export class ClientesProvider {
  Clientes: FirebaseListObservable<Cliente[]>;
  private dbPath: string;
  constructor(private db: AngularFireDatabase) {
    if (sucBasePath) {
      this.dbPath = `${sucBasePath}/Clientes`;
      console.log('Clientes Path:', this.dbPath);
      this.Clientes = this.db.list(this.dbPath);
    }
  }

  add(cliente: Cliente): Observable<string> {
    return new Observable(obs => {
      this.Clientes.subscribe(clientes => {
        let c: Cliente = clientes.find(val => {
          return (val.Nombre.trim().toLowerCase() === cliente.Nombre.trim().toLowerCase());
        });
        if (c) {
          obs.next(`Encontrado: ${c.Nombre
                   } - No se puede Guardar: ${cliente.Nombre}`);
        } else {
          obs.error(`No encontrado: ${cliente.Nombre} - OK Para guardar`);
        }
        obs.complete();
      });
    });
  }
}
