import {Direccion} from './clientes.clases';
import {Documento} from './documentos.class';
import {Color, Perfil} from './productos.clases';

export class Pedido extends Documento {
  FechaEntrega: string = new Date().toISOString();
  DireccionEntrega: Direccion;
  isEntregado: boolean = false;
  isPreparado: boolean = false;
  Items: PedidoItem[] = [];
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
