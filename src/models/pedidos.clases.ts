import {CV} from './../providers/usuario/usuario';
import {Dolar} from './fondos.clases';
import {Direccion} from './clientes.clases';
import {Documento} from './documentos.class';
import {Color, Perfil} from './productos.clases';

export class Pedido extends Documento {
  idCliente: number;
  FechaEntrega: string;
  DireccionEntrega: Direccion;
  isEntregado: boolean = false;
  isEntransito: boolean = false;
  isPreparado: boolean = false;
  Items: PedidoItem[] = [];
  Dolar: Dolar;
  TotalUnidades: number = 0.00;
  TotalUs: number = 0.00;
  DescuentoKilos: number = 0.00;
  DescuentoGeneral: number = 0.00;
  CantidadPaquetes: number = 0;
  CV: CV;
  constructor() {
    super();
    this.FechaEntrega = new Date().toISOString();
  }
}

export class PedidoItem {
  Cantidad: number;
  Perfil: Perfil;
  Color: Color;
  Unidades: number;
  PrecioUs: number;
  Descuento: number;
  isEmbalado: boolean = false;
  isStockActualizado: boolean = false;
}


// Calcula el Subtotal con todos los descuentos
export function calSubTotalCDs(pedido: Pedido): number {
  if (pedido) {
    let subtotal: number = pedido.TotalUs;
    if (pedido.DescuentoKilos > 0) {
      subtotal = subtotal / (1 + (pedido.DescuentoKilos / 100));
    }
    if (pedido.DescuentoGeneral > 0) {
      subtotal = subtotal / (1 + (pedido.DescuentoGeneral / 100));
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
           ((pedido.CV.Monto > 0) ? (1 + (pedido.CV.Monto / 100)) : 1);
  } else {
    return 0.00;
  }
}
