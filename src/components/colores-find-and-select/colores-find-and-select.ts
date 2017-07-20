import {ColoresProvider} from './../../providers/colores/colores';
import {Color} from './../../models/productos.clases';
import {ViewController} from 'ionic-angular';
import {Component} from '@angular/core';
@Component({
  selector: 'colores-find-and-select',
  templateUrl: 'colores-find-and-select.html'
})
export class ColoresFindAndSelectComponent {
  colores: Color[];
  constructor(public viewCtrl: ViewController,
              private coloresP: ColoresProvider) {}

  onSelectColor(color: Color) { this.viewCtrl.dismiss(color); }

  onClose() { this.viewCtrl.dismiss(); }

  onFilter(ev) {
    this.onCancelFilter();
    let val: string = ev.target.value;
    if (val && val.trim().length > 0) {
      this.colores = this.colores.filter((color) => {
        return ((color) &&
                (color.Nombre.toLowerCase().indexOf(val.toLowerCase()) > -1));
      });
    }
  }

  onCancelFilter() {
    this.coloresP.getAll().subscribe((data) => { this.colores = data; });
  }

  ngOnInit() { this.onCancelFilter(); }
}
