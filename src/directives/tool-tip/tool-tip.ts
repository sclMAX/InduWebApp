import {Directive, HostListener, Input} from '@angular/core';
import {Toast, ToastController} from 'ionic-angular';

export let isHelpShow: boolean = false;
@Directive({
  selector: '[tooltip]',  // Attribute selector
})
export class ToolTipDirective {
  @Input() tooltip: string;
  helpToast: Toast;
  isShow: boolean = false;

  constructor(private toastCtrl: ToastController) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!isHelpShow) {
      isHelpShow = true;
      this.helpToast =
          this.toastCtrl.create({position: 'bottom', message: this.tooltip,dismissOnPageChange:true});
      this.helpToast.onDidDismiss(() => {
        isHelpShow = false;
        this.isShow = false;
      });
      this.helpToast.present().then(() => {this.isShow = true}).catch(() => {
        this.isShow = false;
        isHelpShow = false
      });
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (isHelpShow && this.helpToast && this.isShow) {
      this.helpToast.dismiss();
    }
  }
}
