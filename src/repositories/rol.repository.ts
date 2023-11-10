import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Rol, RolRelations, Permiso, RolPermiso} from '../models';
import {RolPermisoRepository} from './rol-permiso.repository';
import {PermisoRepository} from './permiso.repository';

export class RolRepository extends DefaultCrudRepository<
  Rol,
  typeof Rol.prototype.id,
  RolRelations
> {

  public readonly permisos: HasManyThroughRepositoryFactory<Permiso, typeof Permiso.prototype.id,
          RolPermiso,
          typeof Rol.prototype.id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('RolPermisoRepository') protected rolPermisoRepositoryGetter: Getter<RolPermisoRepository>, @repository.getter('PermisoRepository') protected permisoRepositoryGetter: Getter<PermisoRepository>,
  ) {
    super(Rol, dataSource);
    this.permisos = this.createHasManyThroughRepositoryFactoryFor('permisos', permisoRepositoryGetter, rolPermisoRepositoryGetter,);
    this.registerInclusionResolver('permisos', this.permisos.inclusionResolver);
  }
}
