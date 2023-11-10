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
Usuario,
RolUsuario,
Rol,
} from '../models';
import {UsuarioRepository} from '../repositories';

export class UsuarioRolController {
  constructor(
    @repository(UsuarioRepository) protected usuarioRepository: UsuarioRepository,
  ) { }

  @get('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'Array of Usuario has many Rol through RolUsuario',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rol)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Rol>,
  ): Promise<Rol[]> {
    return this.usuarioRepository.roles(id).find(filter);
  }

  @post('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'create a Rol model instance',
        content: {'application/json': {schema: getModelSchemaRef(Rol)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Usuario.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {
            title: 'NewRolInUsuario',
            exclude: ['id'],
          }),
        },
      },
    }) rol: Omit<Rol, 'id'>,
  ): Promise<Rol> {
    return this.usuarioRepository.roles(id).create(rol);
  }

  @patch('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'Usuario.Rol PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {partial: true}),
        },
      },
    })
    rol: Partial<Rol>,
    @param.query.object('where', getWhereSchemaFor(Rol)) where?: Where<Rol>,
  ): Promise<Count> {
    return this.usuarioRepository.roles(id).patch(rol, where);
  }

  @del('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'Usuario.Rol DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Rol)) where?: Where<Rol>,
  ): Promise<Count> {
    return this.usuarioRepository.roles(id).delete(where);
  }
}
