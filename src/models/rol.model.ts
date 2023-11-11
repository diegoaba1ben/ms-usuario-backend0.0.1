import {Entity, belongsTo, hasMany, model, property} from '@loopback/repository';
import {Permiso} from './permiso.model';
import {RolPermiso} from './rol-permiso.model';
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
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  descripcion: string;


  //Diego Benjumea
  @belongsTo(() => Usuario)
  public usuarioId: number;

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
