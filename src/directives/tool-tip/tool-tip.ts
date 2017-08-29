import {HelpProvider} from './../../providers/help/help';
import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[tooltip]',  // Attribute selector
})
export class ToolTipDirective {
  @Input() tooltip: string;

  constructor(private helpP: HelpProvider) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.helpP.setHelp(this.tooltip);
    setTimeout(()=>{
      this.helpP.setHelp('');
    },1500);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.helpP.setHelp('');
  }
}
