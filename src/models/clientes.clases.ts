export class Cliente {
  id: number;
  Nombre: string = '';
  Direccion: Direccion = new Direccion();
  Telefonos: Telefono[] = [new Telefono()];
  Email: string = '';
  Documentos: ClienteDocumentos = new ClienteDocumentos();
  Comentarios: string = '';
}

export interface ClientePedido { id: number; }

export class ClienteDocumentos { Pedidos: ClientePedido[] = []; }

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