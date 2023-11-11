import {Entity, hasMany, model, property} from '@loopback/repository';
import {Rol} from './rol.model';

@model()
export class Usuario extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    //validaciones para nombre
    jsonSchema: {
      minLength: 3, //Longitud mínima
      maxLength: 25, //Longitud máxima
      pattern: '^[A-Za-zzÀ-ÿ]+$',//Solo letras, incluso en otro idioma
      errorMessage: {
        pattern: 'El nombre debe contener únicamente letras.'
      }
    }
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 3, //Longitud mínima
      maxLength: 30,//Longitud máxima
      pattern: '^[A-Za-zzÀ-ÿ]+$',//Solo letras, incluso en otro idioma
      errorMessage: {
        pattern: 'El apellido debe contener solo letras.'//Diego Benjumea
      }
    }
  })
  apellido: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      format: 'email'//Define formato de correo electrónico
    }
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 8, //Longitud mínima
      maxLength: 12, //Longitud máxima
      pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/', // Expresión regular para las reglas de validación
      errorMessage: {
        pattern: 'La contraseña debe tenre entr 8 y 12 caracteres, incluyendo una minúscula, una mayúscula, un número y un caracter especial'
      }
    }
  })
  password: string;

  @hasMany(() => Rol)
  public roles: Rol[];

  constructor(data?: Partial<Usuario>) {
    super(data);
  }


}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
