import {Documento} from './../../../models/documentos.class';
import {SUCURSAL_ROOT} from './../../../providers/sucursal/sucursal';
import {AngularFireDatabase} from 'angularfire2/database';
import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-documentos-add',
  templateUrl: 'documentos-add.html',
})
export class DocumentosAddPage {
  doc: Documento;
  yNow: string;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private db: AngularFireDatabase) {
    this.doc = new Documento();
    let n = new Date().getFullYear();
    console.log(n);
    n++;
    console.log(n);
    this.yNow = `${n}`;
  }

  public AddDocumento() {
    this.db.list(`${SUCURSAL_ROOT}Documentos/`).push(this.doc);
  }

  ionViewDidLoad() {}
}
