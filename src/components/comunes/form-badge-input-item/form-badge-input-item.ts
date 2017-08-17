import { Col } from 'ionic-angular';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'form-badge-input-item',
  templateUrl: 'form-badge-input-item.html'
})
export class FormBadgeInputItemComponent extends Col {
  @Input() label: string = '';
  constructor() { super(); }
}
