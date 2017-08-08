import { Component, Input } from '@angular/core';
import {Col} from "ionic-angular";
@Component({selector: 'form-badge-item', templateUrl: 'form-badge-item.html'})
export class FormBadgeItemComponent extends Col {
  @Input() label:string = '';
  constructor() {
    super();
  }

}
