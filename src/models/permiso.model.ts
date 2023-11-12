import {Entity, hasMany, model, property} from '@loopback/repository';
import {RolPermiso} from './rol-permiso.model';
import {Rol} from './rol.model';

@model()
export class Permiso extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;


  //Diego Benjumea
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 3,//Longitud mínima
      maxLength: 20,//Longitud máxima
      pattern: '^[A-Za-z]+$', // Solo letras
      errorMessage: {
        pattern: 'El nombre solo debe conenr letras.',
      }
    }
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 3,//Longitud mínima
      maxLength: 50,//Lomgitud máxima
      pattern: '^[A-Za-z]+$', // Solo letras
      errorMessage: {
        pattern: 'La descripción no puede ser mayor a 50 caracteres.'
      }
    }
  })
  descripcion: string;

  @hasMany(() => Rol, {
    through: {
      model: () => RolPermiso, keyFrom: 'permisoId', keyTo:
        'rolId'
    }
  })
  public roles: Rol[];

  constructor(data?: Partial<Permiso>) {
    super(data);
  }
}

export interface PermisoRelations {
  // describe navigational properties here
}

export type PermisoWithRelations = Permiso & PermisoRelations;
