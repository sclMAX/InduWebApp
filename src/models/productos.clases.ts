export class Perfil {
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

export class Linea {
  id: string;
  Nombre: string;
  Descripcion: string;
  Adicional:number = 0;
  }

//{"id": "string", "idColorPlanta": "string","Nombre": "string","Descripcion":
//"string",  "PrecioUs": 6, "isPintura":true}
export class Color {
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

export class StockEstado {
  stock: number = 0;
  disponible: number = 0;
  pedidos: StockEstadoPedidosDetalle[] = [];

  constructor(stock?: number) {
    this.stock = stock;
  }

  setPedidos(pedidos: StockEstadoPedidosDetalle[]) {
    this.pedidos = pedidos;
  }

  addPedido(pedido: StockEstadoPedidosDetalle) {
    this.pedidos.push(pedido);
    this.disponible = this.getDisponible();
  }

 getDisponible():number {
    console.log('CALCULA DISPONIBLE!');
    let totalPedidos: number = 0;
    this.pedidos.forEach((item) => {
      totalPedidos += (item.cantidad * 1);
    });
    return this.stock  - totalPedidos;
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