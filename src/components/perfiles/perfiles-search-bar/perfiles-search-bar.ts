import {ProductosProvider} from './../../../providers/productos/productos';
import {Perfil, Linea} from './../../../models/productos.clases';
import {Component, Output, EventEmitter, Input} from '@angular/core';
@Component(
    {selector: 'perfiles-search-bar', templateUrl: 'perfiles-search-bar.html'})
export class PerfilesSearchBarComponent {
  @Input('findCodigo') isShowFindCodigo: boolean = true;
  @Input('findAll') isShowFindAll: boolean = true;
  @Input('selLinea') isShowSelLinea: boolean = true;
  @Output('onFilter')
  onFilter: EventEmitter<Perfil[]> = new EventEmitter<Perfil[]>();
  lineas: Linea[];
  selectedLinea: Linea;
  filterPerfiles: Perfil[];
  isBuscando: boolean = true;

  constructor(private productosP: ProductosProvider) {}

  onCancelOrChangeLinea() {
    this.isBuscando = true;
    this.productosP.getPerfiles(this.selectedLinea)
        .subscribe((data: Perfil[]) => {
          this.isBuscando = false;
          this.filterPerfiles = data;
          this.onFilter.emit(this.filterPerfiles);
        });
  }

  onFilterCodigo(ev) {
    this.onCancelOrChangeLinea();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.toLowerCase();
      this.onFilter.emit(this.filterPerfiles.filter((item: Perfil) => {
        return ((item.Codigo) && (item.Codigo.toLowerCase().indexOf(val) > -1));
      }));
    }
  }

  onFilterAll(ev) {
    this.onCancelOrChangeLinea();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.toLowerCase();
      this.onFilter.emit(this.filterPerfiles.filter((item: Perfil) => {
        return ((item.Codigo) &&
                (item.Codigo.toLowerCase().indexOf(val) > -1)) ||
               ((item.Descripcion) &&
                (item.Descripcion.toLowerCase().indexOf(val) > -1)) ||
               ((item.Linea.Nombre) &&
                (item.Linea.Nombre.toLowerCase().indexOf(val) > -1));
      }));
    }
  }

  ngOnInit() {
    this.productosP.getLineas().subscribe(
        (data: Linea[]) => { this.lineas = data; });
    this.onCancelOrChangeLinea();
  }
}
