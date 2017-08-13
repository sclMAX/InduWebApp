import {CV} from './../providers/usuario/usuario';
import {Dolar} from './fondos.clases';
import {Direccion} from './clientes.clases';
import {Documento} from './documentos.class';
import {Color, Perfil} from './productos.clases';
import * as moment from 'moment';
import {FECHA} from './comunes.clases';

export class Pedido extends Documento {
  idCliente: number;
  fechaEntrega: string;
  DireccionEntrega: Direccion;
  Items: PedidoItem[] = [];
  Dolar: Dolar;
  totalUnidades: number = 0.00;
  totalUs: number = 0.00;
  descuentoKilos: number = 0.00;
  descuentoGeneral: number = 0.00;
  cantidadPaquetes: number = 0;
  CV: CV;
  constructor() {
    super();
    this.fechaEntrega = moment().format(FECHA);
  }
}

export class PedidoItem {
  cantidad: number;
  Perfil: Perfil;
  Color: Color;
  unidades: number;
  precioUs: number;
  descuento: number;
  isEmbalado: boolean = false;
  isStockActualizado: boolean = false;
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
    return calSubTotalCDs(pedido) *
           ((pedido.CV.monto > 0) ? (1 + (pedido.CV.monto / 100)) : 1);
  } else {
    return 0.00;
  }
}
