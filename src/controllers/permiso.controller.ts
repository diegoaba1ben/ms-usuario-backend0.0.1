import {
  Count, CountSchema, Filter, FilterExcludingWhere, repository, Where,
} from '@loopback/repository';
import {
  del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response,
} from '@loopback/rest';
import {Permiso, Rol} from '../models';
import {UsuarioRol} from '../models/usuario-rol.model';
import {
  PermisoRepository, RolPermisoRepository, RolRepository, UsuarioRepository, UsuarioRolRepository
} from '../repositories';

export class PermisoController {
  constructor(
    @repository(PermisoRepository)
    public permisoRepository: PermisoRepository,//Inyección de PermisoRepository
    //inyección de PermisoRepository
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,//Inyección de usuarioRepository
    @repository(RolRepository)
    public rolRepository: RolRepository, //Inyección de RolRepository
    @repository(RolPermisoRepository)
    public rolPermisoRepository: RolPermisoRepository,//Inyección de RolPermisoRepository
    @repository(UsuarioRolRepository)
    public usuarioRolRepository: UsuarioRolRepository,
  ) { }

  @post('/permisos')
  @response(200, {
    description: 'Permiso model instance',
    content: {'application/json': {schema: getModelSchemaRef(Permiso)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permiso, {
            title: 'NewPermiso',
            exclude: ['id'],
          }),
        },
      },
    })
    permiso: Omit<Permiso, 'id'>,
  ): Promise<Permiso> {
    return this.permisoRepository.create(permiso);
  }

  @get('/permisos/count')
  @response(200, {
    description: 'Permiso model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Permiso) where?: Where<Permiso>,
  ): Promise<Count> {
    return this.permisoRepository.count(where);
  }

  @get('/permisos')
  @response(200, {
    description: 'Array of Permiso model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permiso, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Permiso) filter?: Filter<Permiso>,
  ): Promise<Permiso[]> {
    return this.permisoRepository.find(filter);
  }

  @patch('/permisos')
  @response(200, {
    description: 'Permiso PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permiso, {partial: true}),
        },
      },
    })
    permiso: Permiso,
    @param.where(Permiso) where?: Where<Permiso>,
  ): Promise<Count> {
    return this.permisoRepository.updateAll(permiso, where);
  }

  @get('/permisos/{id}')
  @response(200, {
    description: 'Permiso model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Permiso, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Permiso, {exclude: 'where'}) filter?: FilterExcludingWhere<Permiso>
  ): Promise<Permiso> {
    return this.permisoRepository.findById(id, filter);
  }

  //Consulta de permisos por id
  @get('/usuarios/{id}/permisos')
  @response(200, {
    description: 'Instancia de arreglo de permisos',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permiso, {includeRelations: true}),
        },
      },
    },
  })
  async findRolesByUserId(
    @param.path.number('id') id: number,
  ): Promise<Rol[]> {
    // Obtén todas las instancias de UsuarioRol para el usuario dado
    const usuarioRoles = await this.usuarioRepository.usuarioRoles(id).find();

    // Para cada UsuarioRol, obtén el Rol correspondiente
    const roles = await Promise.all(usuarioRoles.map(async (usuarioRol: UsuarioRol) => {
      return this.rolRepository.findById(usuarioRol.rolId);
    }));

    return roles;
  }

  async findPermisosByUserId(
    @param.path.number('id') id: number,
  ): Promise<Permiso[]> {
    // Obtiene todas las instancias de UsuarioRol para el usuario dado
    const usuarioRoles = await this.usuarioRepository.usuarioRoles(id).find();

    // Para cada UsuarioRol, obtiene el Rol correspondiente
    const roles = await Promise.all(usuarioRoles.map(async (usuarioRol: UsuarioRol) => {
      return this.rolRepository.findById(usuarioRol.rolId);
    }));

    // Para cada rol obtenido, se encuentran los permisos asociados
    const permisos: Permiso[] = [];
    for (const rol of roles) {
      const rolPermisos = await this.rolPermisoRepository.find({
        where: {rolId: rol.id},
      });
      for (const rolPermiso of rolPermisos) {
        const permiso = await this.permisoRepository.findById(rolPermiso.permisoId);
        permisos.push(permiso);
      }
    }

    return permisos;
  }
  //Búsqueda por apellido
  @get('/usuarios/{apellido}/permisos')
  @response(200, {
    description: 'Instancia de arreglo de permisos',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permiso, {includeRelations: true}),
        },
      },
    },
  })
  async findPermisosByUserApellido(
    @param.path.string('apellido') apellido: string,
  ): Promise<Permiso[]> {
    // Primero, se obtiene el usuario por su apellido
    const usuario = await this.usuarioRepository.findOne({where: {apellido: apellido}});
    if (!usuario) {
      throw new HttpErrors.NotFound(`Usuario con apellido ${apellido} no encontrado`);
    }

    // Se usa el id del usuario para obtener las instancias de UsuarioRol
    const usuarioRoles = await this.usuarioRepository.usuarioRoles(usuario.id).find();

    // Para cada UsuarioRol, obtén el Rol correspondiente
    const roles = await Promise.all(usuarioRoles.map(async (usuarioRol: UsuarioRol) => {
      return this.rolRepository.findById(usuarioRol.rolId);
    }));

    // Para cada rol obtenido, se encuentran los permisos asociados
    const permisos: Permiso[] = [];
    for (const rol of roles) {
      const rolPermisos = await this.rolRepository.permisos(rol.id).find();
      for (const rolPermiso of rolPermisos) {
        const permiso = await this.rolRepository.permisos(rol.id).find();
        permisos.push(...permiso);
      }
    }

    return permisos;
  }

  //Búsqueda de permisos por correo
  @get('/usuarios/{correo}/permisos')
  @response(200, {
    description: 'Instancia de arreglo de permisos',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permiso, {includeRelations: true}),
        },
      },
    },
  })
  async findPermisosByUserEmail(
    @param.path.string('correo') correo: string,
  ): Promise<Permiso[]> {
    // Primero, se obtiene el usuario por su correo
    const usuario = await this.usuarioRepository.findOne({where: {correo: correo}});
    if (!usuario) {
      throw new HttpErrors.NotFound(`Usuario con correo ${correo} no encontrado`);
    }

    // Se usa el id del usuario para obtener las instancias de UsuarioRol
    const usuarioRoles = await this.usuarioRolRepository.find({
      where: {usuarioId: usuario.id},
    });

    // para cada UsuarioRol obtenido, se encuentra el rol asociado
    const roles: Rol[] = [];
    for (const usuarioRol of usuarioRoles) {
      const rol = await this.rolRepository.findById(usuarioRol.rolId);
      roles.push(rol);
    }

    // para cada rol obtenido, se encuentran los permisos asociados
    const permisos: Permiso[] = [];
    for (const rol of roles) {
      const rolPermisos = await this.rolPermisoRepository.find({
        where: {rolId: rol.id},
      });
      for (const rolPermiso of rolPermisos) {
        const permiso = await this.permisoRepository.findById(rolPermiso.permisoId);
        permisos.push(permiso);
      }
    }

    return permisos;
  }



  @patch('/permisos/{id}')
  @response(204, {
    description: 'Permiso PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permiso, {partial: true}),
        },
      },
    })
    permiso: Permiso,
  ): Promise<void> {
    await this.permisoRepository.updateById(id, permiso);
  }

  @put('/permisos/{id}')
  @response(204, {
    description: 'Permiso PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() permiso: Permiso,
  ): Promise<void> {
    await this.permisoRepository.replaceById(id, permiso);
  }

  @del('/permisos/{id}')
  @response(204, {
    description: 'Permiso DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.permisoRepository.deleteById(id);
  }
}
