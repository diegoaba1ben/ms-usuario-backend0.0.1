// Bloque de prueba Mocha Chai.
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
  // Lista de campos requeridos
  describe('create', () => {
    it('Debería lanzar un error si algún campo está vacío', async () => {
      const usuarioIncompleto: Partial<Usuario> = {
        nombre: '',
        apellido: 'Apellido',
        correo: 'correo@dominio.com',
        password: 'PassSegu123*'
      };

      try {
        await usuarioRepository.create(usuarioIncompleto);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Todos los campos son requeridos !!!');
      }
    });
    it('No debería permitir la creación de un usuario si el email no es válido',
      async () => {
        const usuarioInvalido: Partial<Usuario> = {
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan.perez',
          password: 'ContraseñaSegura123'
        };
        try {
          await usuarioRepository.create(usuarioInvalido);
        }
        catch (error) {
          expect(error).to.be.instanceOf(HttpErrors.BadRequest);
          expect(error.message).to.equal('El correo electrónico no es válido');
        }
      });
    it('Debería lanzar un error si la contraseña no cumple con los requisitos', async () => {
      const usuarioPasswordInvalido: Partial<Usuario> = {
        nombre: 'NombreCompleto',
        apellido: 'Apellidos completos',
        correo: 'correo@dominio.com',
        password: 'PassSeg'
      };
      try {
        await usuarioRepository.create(usuarioPasswordInvalido);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('La contraseña debe tener al menos una letra minúscula',
          'una letra mayúscula, un número, un caracter especial y estar entre 8 y 12 caracteres');
      }
    })
    it('Debería lanzar error si el nombre o el apellido contienen caracteres no alfabéticos',
      async () => {
        const usuarioNombreInvlido: Partial<Usuario> = {
          nombre: 'Nombres',
          apellido: 'Apellidos',
          correo: 'correo@fominio.com',
          password: 'PassSegur123*'
        };
        try {
          await usuarioRepository.create(usuarioNombreInvlido);
        } catch (error) {
          expect(error).to.be.instanceOf(Error);
          expect(error.message).to.equal('Los campos nombres y apellido deben contener letras');
        }
      });
    it('Debería lanzar un error si el correo ya está en uso', async () => {
      const usuarioExistente: Partial<Usuario> = {
        nombre: 'Nombres',
        apellido: 'Apellidos',
        correo: 'correo@dominio.com',
        password: 'PassSegu123*'
      };
      //Intento de creación del usuario
      await usuarioRepository.create(usuarioExistente);
      //Ahora se intenta crear otro usuario con el mismo correo
      try {
        await usuarioRepository.create(usuarioExistente);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('El correo electrónico ya está en uso');
      }
    })
    it('Debería lanzar un error si nombre o apellido excende la longitud máxima', async () => {
      const usuarioNombreLargo: Partial<Usuario> = {
        nombre: 'a'.repeat(52),
        apellido: 'Apellido',
        correo: 'correo@dominio.com',
        password: 'PassSeg123*'
      };
      try {
        await usuarioRepository.create(usuarioNombreLargo);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Los campos nombre y apellido no deben exceder las 30 caracteres');
      }
    })
    //Actualización de datos en usuario
    //Método update
    describe('Actualización de datos en usuario', function () {
      it('Actualización de un usuario existente', async function () {
        //Creación de un usuario válido para la prueba
        const usuarioActualizado = await usuarioRepository.create({
          nombre: 'Pedro',
          apellido: 'Escamoso',
          correo: 'correo@domimio.com',
          password: 'PassSegur123*'
        })
        //Actualización del usuario de prueba
        const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
          {nombre: 'Actualizado'});
        //Verificación de la actualización
        return expect(usuarioRepository.actualizarPorCorreo('correo@dominio.com', {correo: 'existing@user.com'})).to.be.rejectedWith(Error);
      })
    });

  })
  //paréntesis final, ojo
})
