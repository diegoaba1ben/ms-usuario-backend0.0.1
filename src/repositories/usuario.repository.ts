import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuario, UsuarioRelations, Rol, RolUsuario} from '../models';
import {RolUsuarioRepository} from './rol-usuario.repository';
import {RolRepository} from './rol.repository';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly roles: HasManyThroughRepositoryFactory<Rol, typeof Rol.prototype.id,
          RolUsuario,
          typeof Usuario.prototype.id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('RolUsuarioRepository') protected rolUsuarioRepositoryGetter: Getter<RolUsuarioRepository>, @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>,
  ) {
    super(Usuario, dataSource);
    this.roles = this.createHasManyThroughRepositoryFactoryFor('roles', rolRepositoryGetter, rolUsuarioRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
}
