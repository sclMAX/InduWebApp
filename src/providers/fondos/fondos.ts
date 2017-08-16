import {ChequeEntregadoPor, CajaItem} from './../../models/fondos.clases';
import {ClientePago} from './../../models/clientes.clases';
import {
  SUC_FONDOS_CHEQUES_CARTERA,
  SucursalProvider,
  SUC_FONDOS_ROOT
} from './../sucursal/sucursal';
import {Injectable} from '@angular/core';

@Injectable()
export class FondosProvider {
  constructor(private sucP: SucursalProvider) {
  }

  genIngresoPagoUpdateData(updData, pago: ClientePago) {
    let totalCheques: number = 0.00;
    // Ingresar Cheques a Cartera
    pago.Cheques.forEach((cheque) => {
      // Set Id
      cheque.Cheque.id = `${cheque.Cheque.idBanco}-${cheque.Cheque.idSucursal
          }-${cheque.Cheque.numero}`;
      // Set Creador
      cheque.Cheque.Creador = this.sucP.genUserDoc();
      // Set EntregadoPor
      cheque.Cheque.EntregadoPor = new ChequeEntregadoPor();
      cheque.Cheque.EntregadoPor.idCliente = pago.idCliente;
      cheque.Cheque.EntregadoPor.sucursal = this.sucP.getUsuario().sucursal;
      // Crear UpdateData
      updData[`${SUC_FONDOS_CHEQUES_CARTERA}${cheque.Cheque.id}/`] =
          cheque.Cheque;
      // Calcular monto acumulado de cheques
      totalCheques += Number(cheque.Cheque.monto);
    });
    // Generar Item Caja
    let caja: CajaItem = new CajaItem();
    caja.tipoDocumento = pago.tipo;
    caja.numeroDoc = pago.numero;
    caja.efectivo = Number(pago.efectivo);
    caja.dolares = Number(pago.dolares);
    caja.cheques = Number(totalCheques);
    this.genCajaAddIngresoUpdateData(updData,caja);
  }

  genCajaAddIngresoUpdateData(updData, item: CajaItem) {
    item.id = `${item.tipoDocumento}${item.numeroDoc}`;
    item.Creador = this.sucP.genUserDoc();
    item.isIngreso = true;
    updData[`${SUC_FONDOS_ROOT}Caja/${item.id}`] = item;
  }
}