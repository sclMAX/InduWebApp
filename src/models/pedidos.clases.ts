import {CV} from './../providers/usuario/usuario';
import {Dolar} from './fondos.clases';
import {Direccion} from './clientes.clases';
import {Documento, DocStockItem} from './documentos.class';
import * as moment from 'moment';
import {FECHA} from './comunes.clases';

export const PRESUPUESTO: string = 'Presupuesto';
export const PEDIDO: string = 'Pedido';
export const EMBALADO: string = 'Embalado';
export const ENREPARTO: string = 'EnReparto';
export const ENTREGADO: string = 'Entregado';
export const PAGO: string = 'Pago';

export class Pedido extends Documento {
  DireccionEntrega: Direccion;
  Items: PedidoItem[] = [];
  Dolar: Dolar;
  totalUnidades: number = 0.00;
  descuentoKilos: number = 0.00;
  descuentoGeneral: number = 0.00;
  cantidadPaquetes: number = 0;
  totalUs: number = 0.00;
  CV: CV;
  constructor() {
    super();
    this.fechaEntrega = moment().format(FECHA);
  }
}

export class PedidoItem extends DocStockItem {
  unidades: number;
  precioUs: number;
  descuento: number;
  isEmbalado: boolean = false;
}


// Calcula el Subtotal con todos los descuentos
export function calSubTotalCDs(pedido: Pedido): number {
  if (pedido) {
    let subtotal: number = pedido.totalUs;
    if (pedido.descuentoKilos > 0) {
      subtotal = subtotal / (1 + (pedido.descuentoKilos / 100));
    }
    if (pedido.descuentoGeneral > 0) {
      subtotal = subtotal / (1 + (pedido.descuentoGeneral / 100));
    }
    return subtotal;
  } else {
    return 0.00;
  }
}

// Calcula Total final con todos los descuentos y CV
export function calcularTotalFinal(pedido: Pedido): number {
  if (pedido && pedido.CV) {
    pedido.totalFinalUs = calcularTotalCF(pedido) + calcularTotalSF(pedido);
    ;
    return pedido.totalFinalUs;
  } else {
    return 0.00;
  }
}

export function calcularTotalCF(pedido: Pedido): number {
  let res: number = 0.00;
  let subtotal: number = 0.00;
  if (pedido && pedido.CV) {
    subtotal = calSubTotalCDs(pedido);
    res = subtotal * ((pedido.CV.cf > 0) ? (pedido.CV.cf / 100) : 0);
    res = res * ((pedido.CV.iva > 0) ? (1 + (pedido.CV.iva / 100)) : 1);
  }
  return res;
}

export function calcularTotalSF(pedido: Pedido): number {
  let res: number = 0.00;
  let subtotal: number = 0.00;
  if (pedido && pedido.CV) {
    subtotal = calSubTotalCDs(pedido);
    res = subtotal * ((pedido.CV.sf > 0) ? (pedido.CV.sf / 100) : 0);
  }
  return res;
}
