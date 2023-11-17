import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Permiso, Rol, RolPermiso, RolRelations} from '../models';
import {PermisoRepository} from './permiso.repository';
import {RolPermisoRepository} from './rol-permiso.repository';

//Definición de uri en el mismo archivo
const uri = 'mongodb://27017/CFJMBdatabase';

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
    @inject('datasources.mongodb') dataSource: MongoDbDataSource,
    @repository.getter('RolPermisoRepository') protected rolPermisoRepositoryGetter:
      Getter<RolPermisoRepository>,
    @repository.getter('PermisoRepository') protected permisoRepositoryGetter: Getter<PermisoRepository>,
  ) {
    super(Rol, dataSource);
    this.permisos = this.createHasManyThroughRepositoryFactoryFor('permisos', permisoRepositoryGetter, rolPermisoRepositoryGetter,);
    this.registerInclusionResolver('permisos', this.permisos.inclusionResolver);
  }
}
//Función setupRolRepository
export async function setupRolRepository() {
  const dataSource = new MongoDbDataSource({
    name: 'db',
    connector: 'mongodb',
    url: uri,
  });
  const rolPermisoRepositoryGetter = async () => new RolPermisoRepository(dataSource);
  const permisoRepositoryGetter = async () => new PermisoRepository(dataSource);

  return new RolRepository(dataSource, rolPermisoRepositoryGetter, permisoRepositoryGetter);
}
