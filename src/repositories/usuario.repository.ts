import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, Filter, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import * as bcrypt from 'bcrypt';
import {MongoDbDataSource} from '../datasources';
import {Rol, Usuario, UsuarioRelations} from '../models';
import {PermisoRepository} from './permiso.repository';
import {RolRepository} from './rol.repository';
import {UsuarioRolRepository} from './usuario-rol.repository';
/*Definición del repositorio */
//Definición de la uri en el mismo archivo
const uri = 'mongodb://27017/CFJMBdatabase';
/*Clase UsuarioRepositoy Diego Benjumea */
export class UsuarioRepository extends DefaultCrudRepository<Usuario, typeof Usuario.prototype.id,
  UsuarioRelations> {
  // Declaración de la propiedad 'roles'
  public readonly roles: HasManyRepositoryFactory<Rol, typeof Usuario.prototype.id>;
  /*Constructor */
  constructor(
    @inject('datasources.mongodb') dataSource: MongoDbDataSource,
    @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>,
    @repository.getter('UsuarioRolRepository') protected usuarioRolRepositoryGetter: Getter<UsuarioRolRepository>,
  ) {
    super(Usuario, dataSource);
    this.roles = this.createHasManyRepositoryFactoryFor('roles', rolRepositoryGetter);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
  }

  /*Métodos del Repositorio */
  //Validación de contraseña contra el hash
  async verifyPassword(correo: string, providedPassword: string): Promise<boolean> {
    try {
      const usuario = await this.findOne({where: {correo}});
      if (!usuario) {
        //Usuario no encontrado, la contraseña no es
        return false;
      }
      //Bloque que compara la contraseña contra el hash
      const isPasswordValid = await bcrypt.compare(providedPassword, usuario.password);
      return isPasswordValid;
    } catch (error) {
      //Error al buscar usuario
      console.error('Error al verificar la contraseña', error);
      return false;
    }
  }
  // Operaciones CRUD
  async create(usuario: Partial<Usuario>, filter?: Filter<Usuario>): Promise<Usuario> {
    // Verificar si el correo ya está en uso
    const existingEntry = await this.findOne({where: {correo: usuario.correo}});
    if (existingEntry) {
      throw new HttpErrors.BadRequest('El correo electrónico ya está en uso');
    }
    // Crear usuario si no existe
    const createdUsuario = await super.create(usuario, filter);
    const usuarioId = createdUsuario.id;
    // Validar la relación roles
    const roles = await createdUsuario.roles(usuarioId).find();
    if (!roles || roles.length === 0) {
      throw new HttpErrors.BadRequest('El usuario debe tener al menos un rol asignado');
    }
    // Obtener el primer rol asociado al usuario
    const primerRol = roles[0];
    if (!primerRol) {
      throw new HttpErrors.BadRequest('El usuario debe tener al menos un rol asociado');
    }
    // Obtener el nombre del rol
    const rolNombre = primerRol.nombre;
    if (!rolNombre) {
      throw new HttpErrors.BadRequest('Nombre del rol no encontrado en la relación roles del usuario');
    }
    // Obtener el rolId utilizando el nombre del rol
    const rolRepository = await this.rolRepositoryGetter();
    const rolId = await rolRepository.obtenerRolPorNombre(rolNombre);

    if (!rolId) {
      throw new HttpErrors.NotFound(`Rol con nombre ${rolNombre} no encontrado`);
    }

    // Crear la relación en la tabla UsuarioRol
    const usuarioRolRepo = await this.usuarioRolRepositoryGetter();
    await usuarioRolRepo.create({usuarioId, rolId});

    return createdUsuario;
  }





  /*Validaciones */

  //Validación de la unicidad del correo
  private async validarCorreoUnico(correo: string): Promise<void> {
    const existingUser = await this.findOne({where: {correo}});
    if (existingUser) {
      throw new Error('El correo electrónico ya está en uso');
    }
  }

  //1. Método para validar los campos requeridos
  private validarCamposRequeridos(usuario: Partial<Usuario>): void {
    const camposRequeridos: (keyof Usuario)[] = ['nombre', 'apellido', 'correo', 'password', 'estado'];
    for (const campo of camposRequeridos) {
      if (!usuario[campo]) {
        throw new HttpErrors.BadRequest(`No se ha diligenciado el campo '${campo}'`);
      }
    }
    //2. Validación del campo nombre
    if (usuario.nombre && !/^[a-zA-Z]+$/.test(usuario.nombre)) {
      throw new HttpErrors.BadRequest('El nombre sólo puede contener letras');
    }
    //3. Validación para el campo apellido
    if (usuario.apellido && !/^[a-zA-Z]+$/.test(usuario.apellido)) {
      throw new HttpErrors.BadRequest('El apellido solo puede contener letras');
    }
    //4. Validación para el campo correo
    if (usuario.correo && !/^\S+@\S+\.\S+$/.test(usuario.correo)) {
      throw new HttpErrors.BadRequest('Correo electrónico no válido');
    }
    //5. Validación password
    if (usuario.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

      if (!passwordRegex.test(usuario.password)) {
        throw new Error('La contraseña debe tener al menos una letra minúscula, una letra mayúscula, un número, un caracter especial y estar entre 8 y 12 caracteres');
      }
    } else {
      throw new Error('La contraseña es requerida');
    }
    //6. Validación de letras en nombre y apellido incluso en letras extranjeras
    if (usuario.nombre && usuario.apellido) {
      const nombreApellidoRegex = /^[^\s0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      if (!nombreApellidoRegex.test(usuario.nombre) || !nombreApellidoRegex.test(usuario.apellido)) {
        throw new Error('Los campos de nombre y apellido deben contener solamente letras');
      }
    }
    //7.Pruebas para validar que la longitud de nombre y apellido no excedan el límite
    if (usuario.nombre && usuario.apellido) {
      const maxLength = 30;
      if (usuario.nombre.length > maxLength || usuario.apellido.length > maxLength) {
        throw new Error('El campo nombre o apellido excede el tamaño máximo');
      }
    }
  }
  //Consultas
  async obtenerPorCorreo(correo: string): Promise<Usuario | null> {
    return this.findOne({where: {correo}});
  }
  async obtenerTodos() {
    return this.find();
  }
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
  async eliminarPorCorreo(correo: string): Promise<void> {
    try {
      //Buscar el usuario por correo
      const usuario = await this.findOne({where: {correo}});
      //Si el usuario no existe
      if (!usuario) {
        throw new HttpErrors.NotFound('Usuario no encontrado');
      }
      //Eliminación del usuario de la base de datos
      await this.deleteById(usuario.id);
    } catch (error) {
      //Manejo de errores al eliminar el usuario.
      console.error('Error al eliminar el usuario por correo', error);
      throw new HttpErrors.InternalServerError('Error interno al eliminar usuario')
    }
  }

}


/*Funciones auxiliares */
export async function setupUsuarioRepository() {
  const uri = 'mongodb://27017/CFJMBdatabase';
  const dataSource = new MongoDbDataSource({
    name: 'db',
    connector: 'mongodb',
    url: uri,
  });
}

function permisoRepositoryGetter(): Promise<PermisoRepository> {
  throw new Error('Function not implemented.');
}

function usuarioRepositoryGetter(): Promise<PermisoRepository> {
  throw new Error('Function not implemented.');
}
