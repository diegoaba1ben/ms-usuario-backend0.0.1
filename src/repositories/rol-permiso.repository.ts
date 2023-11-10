import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {RolPermiso, RolPermisoRelations} from '../models';

export class RolPermisoRepository extends DefaultCrudRepository<
  RolPermiso,
  typeof RolPermiso.prototype.id,
  RolPermisoRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(RolPermiso, dataSource);
  }
}
