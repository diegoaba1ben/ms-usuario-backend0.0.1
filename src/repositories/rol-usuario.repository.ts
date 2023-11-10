import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {RolUsuario, RolUsuarioRelations} from '../models';

export class RolUsuarioRepository extends DefaultCrudRepository<
  RolUsuario,
  typeof RolUsuario.prototype.id,
  RolUsuarioRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(RolUsuario, dataSource);
  }
}
