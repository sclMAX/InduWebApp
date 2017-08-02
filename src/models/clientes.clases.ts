import {UserDoc} from './user.class';
export class Cliente {
  id: number;
  Nombre: string = '';
  Direccion: Direccion = new Direccion();
  Telefonos: Telefono[] = [new Telefono()];
  Email: string = '';
  Comentarios: string = '';
  Descuentos: Descuento[] = [];
  Creador: UserDoc = new UserDoc();
  Modificador: UserDoc = new UserDoc();
}

export class Descuento {
  id: string;
  Descuento: number;
}

export class Telefono {
  Numero: string;
  Contacto: string;
}

export class Direccion {
  Calle: string;
  Localidad: string = 'Corrientes';
  Provincia: string = 'Corrientes';
  Pais: string = 'Argentina';
}

export class CtaCte {
  id: number;
  idCliente: number;
  Saldo: number = 0.00;
  Items: CtaCteItem[] = [];
}

export class CtaCteItem {
  Documento:string;
  Fecha:string = new Date().toISOString();
  Debe:number = 0.00;
  Haber:number = 0.00;
  Saldo:number = 0.00;
}