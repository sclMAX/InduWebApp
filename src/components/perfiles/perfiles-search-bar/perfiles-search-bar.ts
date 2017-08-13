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
  perfiles: Perfil[];
  isBuscando: boolean = true;

  constructor(private productosP: ProductosProvider) {}

  onCancelOrChangeLinea() {
    if (this.selectedLinea) {
      this.filterPerfiles = this.perfiles.filter(
          (p) => { return p.Linea.id == this.selectedLinea.id; });
    } else {
      this.filterPerfiles = JSON.parse(JSON.stringify(this.perfiles));
    }
    this.onFilter.emit(this.filterPerfiles);
  }

  onFilterCodigo(ev) {
    this.onCancelOrChangeLinea();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.toLowerCase();
      this.onFilter.emit(this.filterPerfiles.filter((item: Perfil) => {
        return ((item.codigo) && (item.codigo.toLowerCase().indexOf(val) > -1));
      }));
    }
  }

  onFilterAll(ev) {
    this.onCancelOrChangeLinea();
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.toLowerCase();
      this.onFilter.emit(this.filterPerfiles.filter((item: Perfil) => {
        return ((item.codigo) &&
                (item.codigo.toLowerCase().indexOf(val) > -1)) ||
               ((item.descripcion) &&
                (item.descripcion.toLowerCase().indexOf(val) > -1)) ||
               ((item.Linea.nombre) &&
                (item.Linea.nombre.toLowerCase().indexOf(val) > -1));
      }));
    }
  }

  ngOnInit() { this.getData(); }

  private async getData() {
    this.isBuscando = true;
    this.productosP.getPerfiles().subscribe((data: Perfil[]) => {
      this.isBuscando = false;
      this.perfiles = data;
      this.onCancelOrChangeLinea();
    });
    this.productosP.getLineas().subscribe(
        (data: Linea[]) => { this.lineas = data; });
  }
}
