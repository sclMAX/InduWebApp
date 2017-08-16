import {ClaseControlada} from './comunes.clases';
export class Stock extends ClaseControlada {
  id: string;
  Stocks: StockItem[] = [];
}

export class StockItem extends ClaseControlada {
  id: string;
  stock: number;
  mpp: number;
  constructor(id?: string, stock?: number, mpp?: number) {
    super();
    this.id = id;
    this.stock = stock;
    this.mpp = mpp;
  }
}

export class StockEstado {
  stock: number = 0;
  disponible: number = 0;
  cantidadEnPedidos: number = 0;
  Pedidos: StockEstadoPedidosDetalle[] = [];
  constructor(stock?: number) {
    this.stock = stock;
    this.Pedidos = [];
  }
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