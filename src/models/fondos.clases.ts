import { UserDoc } from './user.class';
import {Direccion} from './clientes.clases';
export class Fondos {}

export class Dolar {
  id: string = "Dolar";
  Fecha: string = new Date().toISOString();
  Valor: number;
}

export class Cheque{
  id:number;
  idBanco:number;
  idSucursal: number;
  FechaIngreso:string = new Date().toISOString();
  FechaEmision: string;
  FechaCobro:string;
  Monto: number;
  Cuenta: number;
  Firmantes: ChequeFirmante[] = [];
  idCliente:number;
  Creador:UserDoc;
  Modificador:UserDoc;
}

export class ChequeFirmante{
  CUIT:number;
  Nombre:string;
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