import {expect} from '@loopback/testlab';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {MongoDbDataSource} from '../../datasources/mongo-db.datasource';
import {Usuario} from '../../models';
import {UsuarioRepository} from '../../repositories/usuario.repository';

//configuración del servidor de MongoDB en memoria
let usuarioRepository: UsuarioRepository; // vamos a crear una instancia.
let mongod: MongoMemoryServer;

beforeEach(async () => {
  const uri = await mongod.getUri();
  const datasource: MongoDbDataSource = new MongoDbDataSource({
    name: 'db',
    connector: 'mongodb',
    url: uri,
  });
  // Crear una nueva instancia de UsuarioRepository
  usuarioRepository = new UsuarioRepository(datasource, rolRepositoryGetter);
  await givenEmptyDatabase();
})
//Definición de la función de borrado de la base de datos en memoria.
async function givenEmptyDatabase() {
  await usuarioRepository.deleteAll();
}





describe('Usuario (unit)', () => {
  // Aquí es donde llamas a givenEmptyDatabase antes de cada prueba
  beforeEach(async () => {
    await givenEmptyDatabase();
  });

  //Usuario con datos no válidos
  describe('creación de usuario', () => {
    it('crea un usuario con datos válidos', async () => {
      const usuario = new Usuario({
        nombre: 'Test',
        apellido: 'Pérez',
        correo: 'test@example.com',
        password: '',
      });

      // Aquí es donde realmente pruebas el comportamiento.
      // Esto puede variar dependiendo de cómo hayas configurado tus modelos.
      await expect(usuarioRepository.create(usuario)).to.be.fulfilled();
    });

    it('rechaza la creación de un usuario con correo duplicado', async () => {
      const usuario1 = new Usuario({nombre: 'Test', correo: 'test@example.com'});
      await usuarioRepository.create(usuario1);
      const usuario2 = new Usuario({nombre: 'Test', correo: 'test@example.com'});

      // Aquí esperamos que la promesa sea rechazada debido a la restricción de correo único.
      await expect(usuarioRepository.create(usuario2)).to.be.rejected();
    });

    // más pruebas aquí...
  });

  // Aquí es donde defines tu función givenEmptyDatabase
  async function givenEmptyDatabase() {
    await usuarioRepository.deleteAll();
  }
});
function rolRepositoryGetter(): Promise<RolRepository> {
  throw new Error('Function not implemented.');
}

