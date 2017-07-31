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
  constructor() {
    super();
    this.FechaEntrega = new Date().toISOString();
  }

  getTotalUnidades() {
    if (this.Items && this.Items.length > 0) {
      let tU: number = 0;
      this.Items.forEach(
          (item: PedidoItem) => { tU += item.getUnidades() * 1; });
      return tU * 1;
    } else {
      return 0;
    }
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
  getUnidades() {
    if (this.Perfil && this.Color) {
      let pxm: number = (this.Color.isPintura) ? this.Perfil.PesoPintado :
                                                 this.Perfil.PesoNatural;
      return (this.Cantidad * ((pxm) * (this.Perfil.Largo / 1000)));
    } else {
      return 0.00;
    };
  }
  getSubTotalUs() {
    if (this.Color) {
      return this.getUnidades() * this.Color.PrecioUs * 1;
    } else {
      return 0.00;
    }
  }
}
