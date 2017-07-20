import {Perfil} from './../../models/productos.clases';
import {Component} from '@angular/core';
import {ViewController} from "ionic-angular";
@Component({
  selector: 'perfiles-find-and-select',
  templateUrl: 'perfiles-find-and-select.html'
})
export class PerfilesFindAndSelectComponent {
  perfiles: Perfil[];
  showImagenes: boolean = false;
  constructor(public viewCtrl: ViewController) {}

  onFilter(ev) { this.perfiles = ev; }
  onSelectPerfil(perfil: Perfil) { this.viewCtrl.dismiss(perfil); }
  onClose() { this.viewCtrl.dismiss(); }
}
