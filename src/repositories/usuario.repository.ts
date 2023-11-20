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
  usuarioRoles: any;

  /*Constructor */
  constructor(
    @inject('datasources.mongodb') dataSource: MongoDbDataSource,
    @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>
  ) {
    super(Usuario, dataSource);
    this.roles = this.createHasManyRepositoryFactoryFor('roles', rolRepositoryGetter);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }
  /*Método create para las pruebas */
  async create(usuario: Partial<Usuario>, filter?: Filter<Usuario>): Promise<Usuario> {
    const existingUser = await this.findOne({where: {correo: usuario.correo}});
    if (existingUser) {
      throw new HttpErrors.BadRequest('El correo electrónico ya está en uso');
    }
    /*Pruebas de código*/
    //Lista de campos requeridos
    const camposRequeridos: (keyof Usuario)[] = ['nombre', 'apellido', 'correo', 'password'];
    //Verificación si todos los campos están presentes
    for (const campo of camposRequeridos) {
      if (!usuario[campo]) {
        throw new HttpErrors.BadRequest(`no se ha diligenciado el campo '${campo}'`);
      }
    }
    //Validación del campo nombre
    if (usuario.nombre && !/^[a-zA-Z]+$/.test(usuario.nombre)) {
      throw new HttpErrors.BadRequest('El nombre sólo puede contener letras');
    }
    if (usuario.apellido && !/^[a-zA-Z]+$/.test(usuario.apellido)) {
      throw new HttpErrors.BadRequest('El apellido solo puede contener letras');
    }
    if (usuario.correo && !/^\S+@\S+\.\S+$/.test(usuario.correo)) {
      throw new HttpErrors.BadRequest('Correo electrónico no válido');
    }
    //Validación password
    if (usuario.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

      if (!passwordRegex.test(usuario.password)) {
        throw new Error('La contraseña debe tener al menos una letra minúscula, una letra mayúscula, un número, un caracter especial y estar entre 8 y 12 caracteres');
      }
    } else {
      throw new Error('La contraseña es requerida');
    }
    // Validación de letras en nombre y apellido incluso en letras extranjeras

    if (usuario.nombre && usuario.apellido) {
      const nombreApellidoRegex = /^[^\s0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      if (!nombreApellidoRegex.test(usuario.nombre) || !nombreApellidoRegex.test(usuario.apellido)) {
        throw new Error('Los campos de nombre y apellido deben contener solamente letras');
      }
    }
    //Validación para validar que el campo de correo sea único
    if (usuario.correo) {
      const existingUser = await this.findOne({where: {correo: usuario.correo}});
      if (existingUser) {
        throw new Error('El correo electrónico ya está en uso');
      }
    }
    //Pruebas para validar que la longitud de nombre y apellido no excedan el límite
    if (usuario.nombre && usuario.apellido) {
      const maxLength = 30;
      if (usuario.nombre.length > maxLength || usuario.apellido.length > maxLength) {
        throw new Error('El campo nombre o apellido excede el tamaño máximo');
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
  /*Actualización de datos de usuario*/
  //Búsqueda por correo
  async actualizarPorCorreo(correo: string, camposActualizados: Partial<Usuario>) {
    // Búsqueda del usuario en la base de datos por correo electrónico
    const usuario: Usuario | null = await this.findOne({where: {correo}});

    // Si el usuario no existe, lanzar un error
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Actualiza los campos del usuario
    Object.assign(usuario, camposActualizados);

    // Guarda el usuario actualizado en la base de datos
    await this.save(usuario);

    return usuario;
  }

}

//Definición de propiedades

/*Función setupUsuarioRepository*/
export async function setupUsuarioRepository() {
  const uri = 'mongodb://27017/CFJMBdatabase';
  const dataSource = new MongoDbDataSource({
    name: 'db',
    connector: 'mongodb',
    url: uri,
  });

  const rolPermisoRepositoryGetter = async () => new RolPermisoRepository(dataSource);
  const permisoRepositoryGetter = async () => new PermisoRepository(dataSource);
  const rolRepositoryGetter = async () => new RolRepository(dataSource, rolPermisoRepositoryGetter, permisoRepositoryGetter);
  const usuarioRepositoryGetter = async () => new UsuarioRepository(dataSource, rolRepositoryGetter);

  return new UsuarioRepository(dataSource, rolRepositoryGetter);
}



/*Funciones permisoRepositoryGetter y usuarioRepositoryGetter */
function permisoRepositoryGetter(): Promise<PermisoRepository> {
  throw new Error('Function not implemented.');
}

function usuarioRepositoryGetter(): Promise<PermisoRepository> {
  throw new Error('Function not implemented.');
}

