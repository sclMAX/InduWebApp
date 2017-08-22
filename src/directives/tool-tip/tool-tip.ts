import {Toast, ToastController} from 'ionic-angular';
import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[tooltip]',  // Attribute selector
})
export class ToolTipDirective {
  @Input() tooltip: string = '';
  helpToast: Toast;
  constructor(private toastCtrl: ToastController) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.helpToast) {
      this.helpToast =
          this.toastCtrl.create({position: 'bottom', message: this.tooltip});
      this.helpToast.present();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.helpToast) {
      this.helpToast.dismiss();
      this.helpToast = undefined;
    }
  }
}
