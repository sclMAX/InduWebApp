import {Cliente} from './../../models/clientes.clases';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'cliente-list-item-content',
  templateUrl: 'cliente-list-item-content.html'
})
export class ClienteListItemContentComponent {
  @Input('cliente') cliente: Cliente;
  @Input('color') color: string;
  @Input('showActions') isShowActions: boolean = true;
  constructor() {}
}
