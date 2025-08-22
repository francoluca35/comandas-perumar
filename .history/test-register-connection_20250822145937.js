const { MongoClient } = require('mongodb');

async function testRegisterConnection() {
  console.log('🔌 Probando conexión a MongoDB para registro...');
  
  const uri = "mongodb+srv://deamoncompany18:13426587@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
  
  const options = {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 15000,
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  };

  try {
    console.log('📡 Intentando conectar con TLS...');
    const client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const db = client.db('comandas');
    console.log('📚 Base de datos:', db.databaseName);
    
    // Verificar colección users
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Total de usuarios en la base de datos: ${userCount}`);
    
    if (userCount > 0) {
      console.log('📝 Usuarios existentes:');
      const users = await usersCollection.find({}).toArray();
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. Usuario: ${user.username} (${user.rol})`);
      });
    }
    
    // Simular inserción de un usuario de prueba
    console.log('🧪 Probando inserción de usuario...');
    const testUser = {
      username: 'test_user_' + Date.now(),
      email: 'test@example.com',
      password: '$2b$10$test.hash',
      nombreCompleto: 'Usuario de Prueba',
      rol: 'delivery',
      imagen: 'https://example.com/test.jpg',
      createdAt: new Date(),
    };
    
    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Usuario de prueba insertado:', result.insertedId);
    
    // Eliminar el usuario de prueba
    await usersCollection.deleteOne({ _id: result.insertedId });
    console.log('🗑️ Usuario de prueba eliminado');
    
    await client.close();
    console.log('🔌 Conexión cerrada');
    console.log('✅ El registro debería funcionar correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('🔍 Detalles del error:', error);
  }
}

testRegisterConnection();
