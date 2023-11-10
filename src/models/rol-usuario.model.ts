import {Entity, model, property} from '@loopback/repository';

@model()
export class RolUsuario extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  usuarioId?: number;

  @property({
    type: 'number',
  })
  rolId?: number;

  constructor(data?: Partial<RolUsuario>) {
    super(data);
  }
}

export interface RolUsuarioRelations {
  // describe navigational properties here
}

export type RolUsuarioWithRelations = RolUsuario & RolUsuarioRelations;
