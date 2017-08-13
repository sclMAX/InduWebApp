import {ProductosProvider} from './../../providers/productos/productos';
import {Linea} from './../../models/productos.clases';
import {ViewController} from 'ionic-angular';
import {Component} from '@angular/core';

@Component({
  selector: 'lineas-find-and-select',
  templateUrl: 'lineas-find-and-select.html'
})
export class LineasFindAndSelectComponent {
  lineas: Linea[];
  constructor(public viewCtrl: ViewController,
              private lineasP: ProductosProvider) {}
  onSelectLinea(linea: Linea) { this.viewCtrl.dismiss(linea); }

  onClose() { this.viewCtrl.dismiss(); }

  onFilter(ev) {
    this.onCancelFilter();
    let val: string = ev.target.value;
    if (val && val.trim().length > 0) {
      this.lineas = this.lineas.filter((linea) => {
        return ((linea) &&
                (linea.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1));
      });
    }
  }

  onCancelFilter() {
    this.lineasP.getLineas().subscribe((data) => { this.lineas = data; });
  }

  ngOnInit() { this.onCancelFilter(); }
}
