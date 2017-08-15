import { Log } from './../../models/comunes.clases';
import { SucursalProvider, SUC_LOG_ROOT } from './../sucursal/sucursal';
import {Injectable} from '@angular/core';
@Injectable()
export class LogProvider {
  constructor(private sucP: SucursalProvider) {
  }

  genPedidoUpdateData(updData, pedido, tipo){
    let log:Log = this.sucP.genLog(pedido);
    updData[`${SUC_LOG_ROOT}Pedido/${tipo}/${log.id}`] = log;
  }

  genPagoUpdateData(updData, pago, tipo){    
    let log = this.sucP.genLog(pago);
    updData[`${SUC_LOG_ROOT}Pagos/${tipo}/${log.id}`] = log;
  }
}
