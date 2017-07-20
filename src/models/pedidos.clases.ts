import {Direccion} from './clientes.clases';
import {Perfil, Color} from './productos.clases';
import {Documento} from './documentos.class';
export class Pedido extends Documento {
  FechaEntrega: string = new Date().toISOString();
  DireccionEntrega: Direccion;
  isEntregado: boolean = false;
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