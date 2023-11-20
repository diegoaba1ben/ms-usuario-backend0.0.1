import {Entity, hasMany, model, property} from '@loopback/repository';
import {Permiso} from './permiso.model';
import {RolPermiso} from './rol-permiso.model';
import {UsuarioRol} from './usuario-rol.model';
import {Usuario} from './usuario.model';


@model()
export class Rol extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 3, //Longitud mínima
      maxLength: 20, //Longitud máxima
      pattern: '^[A-Za-z]+$',
      errorMessage: {
        pattern: 'El nombre del rol debe contener solo letras.'
      }
    }
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 3, //Longitud mínima
      maxLength: 50, //Longitud máxima
      pattern: '^[A-Za-z]+$',
      errorMessage: {
        pattern: 'La descripción de los roles debe tener 50 caracteres.'
      }
    }
  })
  descripcion: string;


  //Diego Benjumea
  @hasMany(() => Usuario, {
    through: {
      model: () => UsuarioRol,
      keyFrom: 'rolId',
      keyTo: 'usuarioId'
    }
  })


  @hasMany(() => Permiso, {
    through: {
      model: () => RolPermiso, keyFrom: 'rolId', keyTo:
        'permisoId'
    }
  })
  public permisos: Permiso[]

  constructor(data?: Partial<Rol>) {
    super(data);
  }
}

export interface RolRelations {
  // describe navigational properties here
}

export type RolWithRelations = Rol & RolRelations;
