// Script para verificar qué MONGODB_URI está usando la aplicación
console.log('🔍 Verificando variables de entorno...');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'No definida');

// Verificar si existe archivo .env.local
const fs = require('fs');
const path = require('path');

const envFiles = ['.env.local', '.env', '.env.development.local', '.env.production.local'];

console.log('\n📁 Buscando archivos de entorno:');
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.startsWith('MONGODB_URI')) {
        console.log(`   ${line.substring(0, 20)}...`);
      }
    });
  } else {
    console.log(`❌ ${file} no existe`);
  }
});

console.log('\n🔌 Probando conexión con la URI del test-db.js...');
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      ssl: true,
      tlsAllowInvalidCertificates: true
    });
    await client.connect();
    console.log('✅ Conexión exitosa!');
    
    const db = client.db('comandas');
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones:', collections.map(c => c.name));
    
    // Verificar si existe la colección users
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Usuarios en la base de datos: ${userCount}`);
    
    await client.close();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();
