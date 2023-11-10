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

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
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
