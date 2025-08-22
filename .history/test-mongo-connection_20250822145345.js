const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  console.log('🔌 Probando conexión a MongoDB con configuración SSL...');
  
  const uri = "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
  
  const options = {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  };

  try {
    console.log('📡 Intentando conectar...');
    const client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const db = client.db('comandas');
    console.log('📚 Base de datos:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📋 Colecciones disponibles:', collections.map(c => c.name));
    
    // Verificar si existe la colección users
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Usuarios en la base de datos: ${userCount}`);
    
    // Mostrar algunos usuarios si existen
    if (userCount > 0) {
      const users = await usersCollection.find({}).limit(3).toArray();
      console.log('📝 Primeros usuarios:');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - Rol: ${user.rol}`);
      });
    }
    
    await client.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('🔍 Detalles del error:', error);
  }
}

testMongoConnection();
