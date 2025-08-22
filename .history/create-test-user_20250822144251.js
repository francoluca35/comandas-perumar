const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const uri = "mongodb://localhost:27017/comandas";
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB local');
    
    const db = client.db('comandas');
    const usersCollection = db.collection('users');
    
    // Verificar si ya existe el usuario de prueba
    const existingUser = await usersCollection.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('👤 Usuario admin ya existe');
      await client.close();
      return;
    }
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const testUser = {
      username: 'admin',
      email: 'admin@test.com',
      password: hashedPassword,
      nombreCompleto: 'Administrador',
      rol: 'admin',
      imagen: 'https://via.placeholder.com/150',
      createdAt: new Date()
    };
    
    await usersCollection.insertOne(testUser);
    console.log('✅ Usuario de prueba creado exitosamente');
    console.log('👤 Usuario: admin');
    console.log('🔑 Contraseña: admin123');
    
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
