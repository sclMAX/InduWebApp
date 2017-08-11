import { ClaseControlada } from './comunes.clases';
export class Stock extends ClaseControlada{
    id:string;
    Stocks:StockItem [] = [];
}

export class StockItem extends ClaseControlada{
    id:string;
    stock:number;
    mpp:number;
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