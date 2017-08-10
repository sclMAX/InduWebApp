import {ClaseControlada} from './comunes.clases';
export class Perfil extends ClaseControlada {
  id: string;
  Linea: Linea;
  Codigo: string;
  Descripcion: string;
  Largo: number;
  BarrasPaquete: number;
  PesoBase: number;
  PesoNatural: number;
  PesoPintado: number;
}

export class Linea extends ClaseControlada {
  id: string;
  Nombre: string;
  Descripcion: string;
  Adicional: number = 0;
}

export class Color extends ClaseControlada {
  id: string;
  idColorPlanta: string;
  Nombre: string;
  Descripcion: string;
  PrecioUs: number;
  isPintura: boolean;
}


export class Stock {
  idPerfil: string;
  idColor: string;
  stock: number;
  constructor(idPerfil?: string, idColor?: string, stock?: number) {
    this.idPerfil = idPerfil;
    this.idColor = idColor;
    this.stock = stock;
  }
}

export class StockPerfil {
  color: string;
  stock: number;
  constructor(color: string, stock: number) {
    this.color = color;
    this.stock = stock;
  }
}

export class StockEstado {
  stock: number = 0;
  disponible: number = 0;
  pedidos: StockEstadoPedidosDetalle[] = [];
  constructor(stock?: number) { this.stock = stock; }
}

export class StockEstadoPedidosDetalle {
  cantidad: number;
  idPedido: number;
  idCliente: number;

  constructor(cantidad?: number, idPedido?: number, idCliente?: number) {
    this.cantidad = cantidad;
    this.idPedido = idPedido;
    this.idCliente = idCliente;
  }
}