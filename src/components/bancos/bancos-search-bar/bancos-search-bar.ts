import {BancosProvider} from './../../../providers/bancos/bancos';
import {Banco} from './../../../models/fondos.clases';
import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component(
    {selector: 'bancos-search-bar', templateUrl: 'bancos-search-bar.html'})
export class BancosSearchBarComponent {
  @Input() color: string = 'toolBar';
  @Output() data: EventEmitter<Banco[]> = new EventEmitter<Banco[]>();
  private bancos: Banco[];

  constructor(private bancosP: BancosProvider) {}

  cancelFilter() { this.data.emit(this.bancos); }

  onFilter(ev) {
    let val: string = ev.target.value;
    if (val && val.trim() != '') {
      val = val.trim().toLowerCase();
      this.data.emit(this.bancos.filter((b) => {
        return (b.id && (b.id.toString().indexOf(val) > -1)) ||
               (b.Nombre && (b.Nombre.trim().toLowerCase().indexOf(val) > -1));
      }));
    }
  }

  ngOnInit() { this.getData(); }

  private async getData() {
    this.bancosP.getAll().subscribe((bancos) => {
      this.bancos = bancos;
      this.cancelFilter();
    });
  }
}
