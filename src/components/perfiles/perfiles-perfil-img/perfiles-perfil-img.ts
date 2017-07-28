import {Perfil} from './../../../models/productos.clases';
import {Component, Input} from '@angular/core';
@Component(
    {selector: 'perfiles-perfil-img', templateUrl: 'perfiles-perfil-img.html'})
export class PerfilesPerfilImgComponent {
  @Input() perfil: Perfil;

  constructor() {}
}
