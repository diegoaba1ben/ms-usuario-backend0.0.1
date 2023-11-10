import {Entity, model, property} from '@loopback/repository';

@model()
export class RolPermiso extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  rolId?: number;

  @property({
    type: 'number',
  })
  permisoId?: number;

  constructor(data?: Partial<RolPermiso>) {
    super(data);
  }
}

export interface RolPermisoRelations {
  // describe navigational properties here
}

export type RolPermisoWithRelations = RolPermiso & RolPermisoRelations;
