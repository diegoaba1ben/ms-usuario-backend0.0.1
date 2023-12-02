import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Rol, Usuario, UsuarioRelations} from '../models';
import {UsuarioRol} from '../models/usuario-rol.model';
import {RolRepository} from './rol.repository';


export class UsuarioRolRepository extends DefaultCrudRepository<
  UsuarioRol, typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly roles: HasManyThroughRepositoryFactory<Rol, typeof Rol.prototype.id,
    UsuarioRol,
    typeof UsuarioRol.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: MongoDbDataSource,
    @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>,
    @repository.getter('UsuarioRolRepository') protected usuarioRolRepositoryGetter: Getter<UsuarioRolRepository>,
  ) {
    super(UsuarioRol, dataSource);
    this.roles = this.createHasManyThroughRepositoryFactoryFor('roles', rolRepositoryGetter,
      usuarioRolRepositoryGetter);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
  /*Bloque de validaciones*/
  //Método para validar y crear la relación
  async createForUsuario(usuarioId: number, rolId: number): Promise<UsuarioRol> {
    // Verificar si ya existe la relación
    const existingEntry = await this.findOne({where: {usuarioId, rolId}});
    if (existingEntry) {
      return existingEntry;
    }

    // Crear una nueva instancia de UsuarioRol con las relaciones de pertenencia
    const newUsuarioRol = new UsuarioRol({usuarioId, rolId});

    // Persistir la nueva instancia en la base de datos
    return this.create(newUsuarioRol);
  }

}
