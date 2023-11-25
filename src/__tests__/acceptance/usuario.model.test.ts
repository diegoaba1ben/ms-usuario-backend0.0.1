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
    it('Debería lanzar un error si nombre o apellido excede la longitud máxima', async () => {
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
        const usuarioCreado = await usuarioRepository.create({
          nombre: 'Pedro',
          apellido: 'Escamoso',
          correo: 'correo@domimio.com',
          password: 'PassSegur123*'
        })
        //Actualización del usuario de prueba
        const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
          {nombre: 'Actualizado'});

        // Obtención de un usuario actualizado por correo
        const usuarioActualizado = await usuarioRepository.obtenerPorCorreo('correo@dominio.com');

        //Verificación de la actualización
        if (usuarioActualizado) {
          expect(usuarioActualizado.nombre).to.equal('Actualizado');
        } else {
          throw new Error('No se encontró usuario');
        }
        //Verificación de la actualización
        expect(usuarioActualizado.nombre).to.equal('Actualizado');
      })
    });
    //Para actualizar múltiples campos de un usuario
    it('Debería actualizar exitosamente varios campos ', async function () {
      // Actualización del usuario de prueba
      const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
        {nombre: 'Actualizado'});

      // Obtención de un usuario actualizado por correo
      const usuarioActualizado = await usuarioRepository.obtenerPorCorreo('correo@dominio.com');

      // Verificación de la actualización
      if (usuarioActualizado) {
        expect(usuarioActualizado.nombre).to.equal('Actualizado');
      } else {
        throw new Error('No se encontró usuario');
      }
    });
    //Validación de actualizaciones a un usuario por correo
    it('Debería validar el intento de actualización de un usuario', async function () {
      let error;
      // Intento de actualización del usuario de prueba con un correo electrónico inválido
      try {
        const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
          {correo: 'correo inválido'});
      } catch (err) {
        error = err;
      }
      // Debería haber un error
      if (error) {
        expect(error).to.be.ok;
      } else {
        throw new Error('No se lanzó un error');
      }
    });
    //Actualización dejando los mismos datos existentes en los campos.
    it('Valida que a la creación tenga los mismos valores existentes en un usuario', async function () {
      // Creación de un usuario válido para la prueba
      const usuarioCreado = await usuarioRepository.create({
        nombre: 'Pedro',
        apellido: 'Escamoso',
        correo: 'correo@dominio.com',
        password: 'PassSegur123*'
      })

      // Actualización del usuario de prueba con los mismos valores
      const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
        {nombre: 'Pedro', apellido: 'Escamoso'});

      // No debería haber errores
    });
    // Intento de actualización con datos no válidos.
    it('Debería validar los datos para actualizar un usuario', async function () {
      // Creación de un usuario válido para la prueba
      const usuarioCreado = await usuarioRepository.create({
        nombre: 'Pedro',
        apellido: 'Escamoso',
        correo: 'correo@dominio.com',
        password: 'PassSegur123*'
      })

      // Intento de actualización del usuario de prueba con un correo electrónico inválido
      try {
        const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
          {correo: 'correo inválido'});
      } catch (error) {
        // Debería haber un error
        expect(error).to.be.ok;
      }
    });
    it('Debería actualizar las actualizcione de un usuario', async function () {
      // Creación de un usuario válido para la prueba
      const usuarioCreado = await usuarioRepository.create({
        nombre: 'Pedro',
        apellido: 'Escamoso',
        correo: 'correo@dominio.com',
        password: 'PassSegur123*'
      })

      // Intento de actualización del usuario de prueba con un correo electrónico inválido
      try {
        const updateUsuario = await usuarioRepository.actualizarPorCorreo('correo@dominio.com',
          {correo: 'correo inválido'});
      } catch (error) {
        // Debería haber un error
        expect(error).to.be.ok;
      }
    });
    /*Bloque para las consultas */
    //Obtención de todos los usuarios
    describe('UsuarioController', async () => {
      let usuarioRepository: UsuarioRepository;
      //crea una nueva instancia de UsuarioRepository
      usuarioRepository = await setupUsuarioRepository();
    });


    it('Deberíamos obtener todos los usuarios', async function () {
      // Creación de un nuevo usuario
      const nuevoUsuario: Usuario = new Usuario(/* añade tus propiedades de usuario aquí */);
      await usuarioRepository.create(nuevoUsuario);

      // Obtención de todos los usuarios
      const usuarios = await usuarioRepository.obtenerTodos();
    });
    it('Deberíamos obtener los suarios por estado', async function () {
      //Creación de nuevos usuarios
      const usuarioActivo: Usuario = new Usuario({
        nombre: 'Pedro',
        apellido: 'Escamoso',
        correo: 'correo@dominio.com',
        password: 'PassSegur123*',
        estado: true
      })
      const UsuarioInactivo: Usuario = new Usuario({
        nombre: 'Pedro',
        apellido: 'Escamoso',
        correo: 'correo@dominio.com',
        password: 'PassSegur123*',
        estado: false
      })
      await usuarioRepository.create(usuarioActivo);
      await usuarioRepository.create(UsuarioInactivo);
      //Obtención de todos los usuarios activos
      const usuariosActivos = await usuarioRepository.find({where: {estado: true}});
      //Verificación de la obtención
      expect(usuarioActivo).to.be.an.instanceOf(Usuario);
      expect(usuariosActivos.length).to.be.greaterThan(0);
      usuariosActivos.forEach(usuario => {
        expect(usuario.estado).to.be.true;
      });
    });
  })
  //paréntesis final, ojo
})
