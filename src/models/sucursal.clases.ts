import {Color} from './productos.clases';
import {Cliente} from './clientes.clases';

export class Sucursal {
  id: string;
  Clientes: Cliente[];
  Colores: Color[];
  documentos: number;
  Contadores: SucursalContadores;
}

export class SucursalContadores {
  id: string;
  pedido: number;
  docStockIngreso: number;
  pago: number;
}