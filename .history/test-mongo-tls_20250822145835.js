const { MongoClient } = require('mongodb');

async function testMongoTLS() {
  console.log('🔌 Probando conexión a MongoDB con TLS...');
  
  const uri = "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
  
  const options = {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 15000,
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    tls: true,
    tlsInsecure: true,
  };

  try {
    console.log('📡 Intentando conectar con TLS...');
    const client = new MongoClient(uri, options);
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const db = client.db('comandas');
    console.log('📚 Base de datos:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📋 Colecciones disponibles:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testMongoTLS();
