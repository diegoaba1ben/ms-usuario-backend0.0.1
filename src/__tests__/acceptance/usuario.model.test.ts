import {HttpErrors} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {Usuario} from '../../models';
import {UsuarioRepository} from '../../repositories';
import {setupUsuarioRepository} from '../../repositories/usuario.repository';

// Bloque de prueba Mocha Chai.
describe('UsuarioRepository', () => {
  let usuarioRepository: UsuarioRepository;

  beforeEach(async () => {
    usuarioRepository = await setupUsuarioRepository();
  });

  it('No debería permitir la creación de un usuario si falta un campo', async () => {
    const usuarioIncompleto: Partial<Usuario> = {
      nombre: 'Juan',
    };

    try {
      await usuarioRepository.create(usuarioIncompleto);
    } catch (error) {
      expect(error).to.be.instanceOf(HttpErrors.BadRequest);
      expect(error.message).to.equal('Falta el campo \'apellido\'');
    }
  });
});


