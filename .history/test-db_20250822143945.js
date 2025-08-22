const { MongoClient } = require('mongodb');

async function testConnection() {
  // URL de MongoDB Atlas (debes completarla en .env.local)
  const uri = "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
  
  console.log('🔌 Probando conexión a MongoDB...');
  
  try {
    const client = new MongoClient(uri, {
      ssl: true,
      sslValidate: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const db = client.db('comandas');
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();
