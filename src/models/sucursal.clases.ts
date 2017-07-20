import {Fondos} from './fondos.clases';
import {Documento} from './documentos.class';
import {Color} from './productos.clases';
import {Cliente} from './clientes.clases';

export class Sucursal {
  id: string;
  Clientes: Cliente[];
  Colores: Color[];
  Documentos: number;
  Contadores: SucursalContadores;
  Fondos: Fondos;
}

export class SucursalContadores {
  id: string;
  Pedidos: number;
}