import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
  import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
Rol,
RolPermiso,
Permiso,
} from '../models';
import {RolRepository} from '../repositories';

export class RolPermisoController {
  constructor(
    @repository(RolRepository) protected rolRepository: RolRepository,
  ) { }

  @get('/rols/{id}/permisos', {
    responses: {
      '200': {
        description: 'Array of Rol has many Permiso through RolPermiso',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Permiso)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Permiso>,
  ): Promise<Permiso[]> {
    return this.rolRepository.permisos(id).find(filter);
  }

  @post('/rols/{id}/permisos', {
    responses: {
      '200': {
        description: 'create a Permiso model instance',
        content: {'application/json': {schema: getModelSchemaRef(Permiso)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Rol.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permiso, {
            title: 'NewPermisoInRol',
            exclude: ['id'],
          }),
        },
      },
    }) permiso: Omit<Permiso, 'id'>,
  ): Promise<Permiso> {
    return this.rolRepository.permisos(id).create(permiso);
  }

  @patch('/rols/{id}/permisos', {
    responses: {
      '200': {
        description: 'Rol.Permiso PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permiso, {partial: true}),
        },
      },
    })
    permiso: Partial<Permiso>,
    @param.query.object('where', getWhereSchemaFor(Permiso)) where?: Where<Permiso>,
  ): Promise<Count> {
    return this.rolRepository.permisos(id).patch(permiso, where);
  }

  @del('/rols/{id}/permisos', {
    responses: {
      '200': {
        description: 'Rol.Permiso DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Permiso)) where?: Where<Permiso>,
  ): Promise<Count> {
    return this.rolRepository.permisos(id).delete(where);
  }
}
