import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {hash} from 'bcrypt'; //
import {Rol, Usuario} from '../models';
import {RolRepository, UsuarioRepository} from '../repositories';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(RolRepository)
    public rolRepository: RolRepository
  ) { }

  @get('roles')
  async getAllRoles(): Promise<Rol[]> {
    return this.rolRepository.find();
  }

  @post('/usuarios/registro')
  @response(200, {
    description: 'Creación y registro de usuario',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    //Encripta contraseñas antes de almacenarlas
    const hashedPassword = await hash(usuario.password, 10);
    usuario.password = hashedPassword;
    //Crea el nuevo usuario
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  //Diego Benjumea
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  //Búsqueda por nombre
  @get('/usuarios/nombre/{nombre}')
  @response(200, {
    description: 'usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findByApellido(
    @param.path.string('apellido') apellido: string,
  ): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({where: {apellido}});
  }

  //Búsqueda por correo
  @get('/usuarios/correo/{correo}', {
    responses: {
      '200': {
        description: 'Usuario model instance',
        content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
      },
    },
  })
  async findByCorreo(
    @param.path.string('correo') correo: string,
  ): Promise<Usuario> {
    const filter: Filter<Usuario> = {
      where: {
        correo: correo
      }
    };
    const usuario = await this.usuarioRepository.findOne(filter);
    if (!usuario) {
      throw new HttpErrors.NotFound(`No user found with this email: ${correo}`);
    }
    return usuario;
  }

  //Filtro avanzado
  @get('/usuarios')
  @response(200, {
    description: 'Instancia de búsqueda avanzada',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  Advanced(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  //Asignación de roles por apellido
  @patch('/usuarios/apellido/{apellido}/roles/{roleId}', {
    responses: {
      '204': {
        description: 'Asignación de rol a usuario exitosa',
      },
    },
  })
  async assignRoleByApellido(
    @param.path.string('apellido') apellido: string,
    @param.path.string('roleId') roleId: string,
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({where: {apellido}});
    if (!usuario) {
      throw new HttpErrors.NotFound(`Apellido deusuario no encontrado : ${apellido}`);
    }
    await this.usuarioRepository.roles(usuario.id).link(roleId);
  }

  //Asignación de rol por correo

  @patch('/usuarios/correo/{correo}/roles/{roleId}', {
    responses: {
      '204': {
        description: 'Asignación de rol a usuario exitosa',
      },
    },
  })
  async assignRoleByCorreo(
    @param.path.string('correo') correo: string,
    @param.path.string('roleId') roleId: string,
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({where: {correo}});
    if (!usuario) {
      throw new HttpErrors.NotFound(`Correo de usuario no encontrado: ${correo}`);
    }
    await this.usuarioRepository.roles(usuario.id).link(roleId);
  }

  //Desasignación de rol por apellido
  @del('/usuarios/apellido/{apellido}/roles/{roleId}', {
    responses: {
      '204': {
        description: 'Usuario desasignado correctamente.',
      },
    },
  })
  async unassignRoleByApellido(
    @param.path.string('apellido') apellido: string,
    @param.path.string('roleId') roleId: string,
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({where: {apellido}});
    if (!usuario) {
      throw new HttpErrors.NotFound(`No user found with this apellido: ${apellido}`);
    }
    await this.usuarioRepository.roles(usuario.id).unlink(roleId);
  }
  //Opciones de eliminación para el web máster
  //Eliminación por apellido
  @del('/usuarios/apellido/{apellido}', {
    responses: {
      '204': {
        description: 'Usuario borrado exitosamente',
      },
    },
  })
  async deleteByApellido(
    @param.path.string('apellido') apellido: string,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    //método
    const currentUserRoles = await this.usuarioRepository.roles(currentUserProfile[securityId]).find();
    const isWebMaster = currentUserRoles.some((role: {name: string;}) => role.name === 'WebMaster');

    if (!isWebMaster) {
      throw new HttpErrors.Forbidden('Solo el Web Máster puede eliminar usuarios.');
    }

    const usuario = await this.usuarioRepository.findOne({where: {apellido}});
    if (!usuario) {
      throw new HttpErrors.NotFound(`Usuario no encontrado con este apellido: ${apellido}`);
    }
    await this.usuarioRepository.deleteById(usuario.id);
  }
  //Eliminación por correo
  @del('/usuarios/correo/{correo}', {
    responses: {
      '204': {
        description: 'Usuario DELETE success',
      },
    },
  })
  async deleteByEmail(
    @param.path.string('correo') correo: string,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    // método
    const currentUserRoles = await this.usuarioRepository.roles(currentUserProfile[securityId]).find();
    const isWebMaster = currentUserRoles.some((role: {correo: string;}) => role.correo === 'WebMaster');
    if (!isWebMaster) {
      throw new HttpErrors.Forbidden('Solo el Web Máster puede eliminar usuarios.');
    }
    const usuario = await this.usuarioRepository.findOne({where: {correo}});
    if (!usuario) {
      throw new HttpErrors.NotFound('usuario no encontrado con este correo: ${correo}');
    }
    await this.usuarioRepository.deleteById(usuario.id);
  }
}
