import {COMUN_CONTADORES} from './../../models/dbGlobalVars';
import {Cliente} from './../../models/cliente.class';
import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {
  AngularFireDatabase,
  FirebaseObjectObservable
} from "angularfire2/database";

@Component({
  selector: 'page-clientes-add',
  templateUrl: 'clientes-add.html',
})
export class ClientesAddPage {
  newCliente: Cliente;
  currentId: FirebaseObjectObservable<any>;
  constructor(public viewCtrl: ViewController,
              private db: AngularFireDatabase) {
    this.newCliente = new Cliente();
    this.currentId = this.db.object(`${COMUN_CONTADORES}`);
    this.getCurrentId();
  }

  private async getCurrentId() {
    this.currentId.subscribe(id => {
      console.log('ID:', id.Clientes);
      if (id.Clientes >=0) {
        this.newCliente.idCliente = id.Clientes + 1;
      }
    });
  }

  onAceptar() { this.viewCtrl.dismiss(); }

  onCancelar() { this.viewCtrl.dismiss(); }

  ionViewDidLoad() { console.log('ionViewDidLoad ClientesAddPage'); }
}
