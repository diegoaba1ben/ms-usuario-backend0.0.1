import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, Filter, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import * as bcrypt from 'bcrypt';
import {MongoDbDataSource} from '../datasources';
import {Rol, Usuario, UsuarioRelations} from '../models';
import {PermisoRepository} from './permiso.repository';
import {RolPermisoRepository} from './rol-permiso.repository';
import {RolRepository} from './rol.repository';

//Definición de la uri en el mismo archivo
const uri = 'mongodb://27017/CFJMBdatabase';

/*Clase UsuarioRepositoy Diego Benjumea */
export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {
  public readonly roles: HasManyRepositoryFactory<Rol, typeof Usuario.prototype.id>;

  /*Constructor */
  constructor(
    @inject('datasources.mongodb') dataSource: MongoDbDataSource,
    @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>
  ) {
    super(Usuario, dataSource);
    this.roles = this.createHasManyRepositoryFactoryFor('roles', rolRepositoryGetter);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
  /*Método create */
  async create(usuario: Partial<Usuario>, filter?: Filter<Usuario>): Promise<Usuario> {
    const existingUser = await this.findOne({where: {correo: usuario.correo}});
    if (existingUser) {
      throw new HttpErrors.BadRequest('El correo electrónico ya está en uso');
    }
    /*Validación de los campos*/
    //Lista de campos requeridos
    const camposRequeridos: (keyof Usuario)[] = ['nombre', 'apellido', 'correo', 'password'];
    //Verificación si todos los campos están presentes
    for (const campo of camposRequeridos) {
      if (!usuario as any) {
        throw new HttpErrors.BadRequest(`no se ha diligenciado el campo '${campo}'`);
      }
    }

    /*Método verify password */
    //hasheo de contraseña
    if (usuario.password) {
      const hashedPassword = await bcrypt.hash(usuario.password, 10);
      usuario.password = hashedPassword;
    }
    else {
      //manejo del caso contrario en el que usuario.password es indefinido
      throw new Error('La contraseña no puede ser vacia');
    }
    return super.create(usuario);

  }
  //Validación de contraseña contra el hash
  async verifyPassword(correo: string, providedPassword: string): Promise<boolean> {
    const user = await this.findOne({where: {correo}});
    if (!user) {
      throw new HttpErrors.NotFound('usuario no encontrado');
    }
    const isPasswordValid = await bcrypt.compare(providedPassword, user.password);
    return isPasswordValid;
  }
}
/*Función setupUsuarioRepository*/
export async function setupUsuarioRepository() {
  const uri = 'mongodb://27017/CFJMBdatabase';
  const dataSource = new MongoDbDataSource({
    name: 'db',
    connector: 'mongodb',
    url: uri,
  });
  const rolPermisoRepositoryGetter = async () => new RolPermisoRepository(dataSource);
  const rolRepositoryGetter = async () => new RolRepository(dataSource, rolRepositoryGetter, usuarioRepositoryGetter);

  return new UsuarioRepository(dataSource, rolRepositoryGetter);
}
/*Funciones permisoRepositoryGetter y usuarioRepositoryGetter */
function permisoRepositoryGetter(): Promise<PermisoRepository> {
  throw new Error('Function not implemented.');
}

function usuarioRepositoryGetter(): Promise<PermisoRepository> {
  throw new Error('Function not implemented.');
}

