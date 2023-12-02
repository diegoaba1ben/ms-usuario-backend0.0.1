import {Entity, belongsTo, model, property} from '@loopback/repository';
import {Rol} from './rol.model';
import {Usuario} from './usuario.model';

@model({
  settings: {
    indexes: {
      uniqueUsuarioRolIndex: {
        keys: {
          usuarioId: 1,
          rolId: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
export class UsuarioRol extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Usuario, {keyFrom: 'usuarioId', name: 'usuario'})
  usuarioId: number;
  @belongsTo(() => Rol, {keyFrom: 'rolId', name: 'rol'})
  rolId: number;

  constructor(data?: Partial<UsuarioRol>) {
    super(data);
  }
}
