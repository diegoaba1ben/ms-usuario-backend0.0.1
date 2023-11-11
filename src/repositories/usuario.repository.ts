import {inject} from '@loopback/core';
import {DefaultCrudRepository, Filter} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import * as bcrypt from 'bcrypt';
import {MongoDbDataSource} from '../datasources';
import {Usuario, UsuarioRelations} from '../models';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongoDbDataSource,
  ) {
    super(Usuario, dataSource);
  }

  async create(usuario: Usuario, filter?: Filter<Usuario>): Promise<Usuario> {
    const existingUser = await this.findOne({where: {correo: usuario.correo}});
    if (existingUser) {
      throw new HttpErrors.BadRequest('El correo electrónico ya está en uso');
    }
    //hasheo de contraseña
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    usuario.password = hashedPassword;
    return super.create(usuario, filter);
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
