export class UserLogin {
  email: string;
  password: string;
}

export class Usuario{
  id:string;
  Sucursal:string;
  Nombre:string;
  isEmbalaje:boolean = true;
  MaxDescuentoItem:number = 0.00;
  MaxDescuentoGeneral:number = 0.00;
}

export class UserDoc {
    Usuario: Usuario = new Usuario();
    Fecha: string = new Date().toISOString();
  }