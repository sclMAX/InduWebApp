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
  Localidad: string;
  Provincia: string;
  Pais: string;
}