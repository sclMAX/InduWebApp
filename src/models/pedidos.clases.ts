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
