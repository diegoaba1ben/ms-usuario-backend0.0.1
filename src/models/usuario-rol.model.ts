import {Entity, belongsTo, model, property} from '@loopback/repository';
import {Rol} from './rol.model';
import {Usuario} from './usuario.model';

@model()
export class UsuarioRol extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Usuario)
  usuarioId: number;

  @belongsTo(() => Rol)
  rolId: number;

  constructor(data?: Partial<UsuarioRol>) {
    super(data);
  }
}
