import {UserDoc} from './user.class';
import {Direccion} from './clientes.clases';
import * as moment from 'moment';
export class Fondos {}

export class Dolar {
  id: string = "Dolar";
  Fecha: string = new Date().toISOString();
  Valor: number;
}

export class Cheque {
  id: string;  // "idBanco"-"idSucursal"-"Numero"
  idBanco: number;
  idSucursal: number;
  Numero: number;
  FechaIngreso: string = moment().format('DD/MM/YYYY');
  FechaEmision: string;
  FechaCobro: string;
  Monto: number;
  Cuenta: number;
  Firmantes: ChequeFirmante[] = [];
  EntregadoPor: ChequeEntregadoPor;
  EntregadoA: ChequeEntregadoA;
  Creador: UserDoc;
  Modificador: UserDoc;
  Comentarios: string;
}

export class ChequeEntregadoPor {
  Sucursal: string;
  idCliente: number;
}

export class ChequeEntregadoA {
  Nombre: string;
  Fecha: string = new Date().toISOString();
}

export class ChequeFirmante {
  CUIT: number;
  Nombre: string;
}

export class Banco {
  id: number;
  Nombre: string;
  Sucursales: BancoSucursal[] = [];
  Creador: UserDoc;
  Modificador: UserDoc;
}

export class BancoSucursal {
  id: number;
  Nombre: string;
  Direccion: Direccion = new Direccion();
  Telefono: string;
}