const { MongoClient } = require('mongodb');

async function testLocalConnection() {
  const uri = "mongodb://localhost:27017/comandas";
  
  console.log('🔌 Probando conexión a MongoDB local...');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Conexión exitosa a MongoDB local!');
    
    const db = client.db('comandas');
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones:', collections.map(c => c.name));
    
    // Verificar si hay usuarios
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('👥 Usuarios en la base de datos:', userCount);
    
    await client.close();
  } catch (error) {
    console.error('❌ Error de conexión local:', error.message);
    console.log('💡 Asegúrate de tener MongoDB instalado y ejecutándose localmente');
  }
}

testLocalConnection();
