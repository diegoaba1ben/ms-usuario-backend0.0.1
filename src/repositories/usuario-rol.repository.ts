import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Rol, Usuario, UsuarioRelations} from '../models';
import {UsuarioRol} from '../models/usuario-rol.model';
import {RolRepository} from './rol.repository';
import {UsuarioRepository} from './usuario.repository';


export class UsuarioRolRepository extends DefaultCrudRepository<
  UsuarioRol,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly roles: HasManyThroughRepositoryFactory<Rol, typeof Rol.prototype.id,
    UsuarioRol,
    typeof UsuarioRol.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: MongoDbDataSource,
    @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>,
    @repository.getter('UsuarioRepository') protected usuarioRolRepositoryGetter: Getter<UsuarioRepository>,
  ) {
    super(UsuarioRol, dataSource);
    this.roles = this.createHasManyThroughRepositoryFactoryFor('roles', rolRepositoryGetter,
      usuarioRolRepositoryGetter);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
}
