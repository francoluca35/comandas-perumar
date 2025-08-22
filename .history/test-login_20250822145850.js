const { MongoClient } = require('mongodb');

async function testLogin() {
  console.log('🔌 Probando conexión a MongoDB para login...');
  
  const uri = "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
  
  const options = {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 15000,
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    ssl: false,
    tls: false,
  };

  try {
    console.log('📡 Intentando conectar...');
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
      console.log('📝 Listando usuarios:');
      const users = await usersCollection.find({}).toArray();
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. Usuario: ${user.username}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Rol: ${user.rol}`);
        console.log(`      Nombre: ${user.nombreCompleto}`);
        console.log(`      Tiene contraseña: ${!!user.password}`);
        console.log(`      Tiene imagen: ${!!user.imagen}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay usuarios en la base de datos');
    }
    
    // Verificar colección turnos
    const turnosCollection = db.collection('turnos');
    const turnoCount = await turnosCollection.countDocuments();
    console.log(`🔄 Total de turnos en la base de datos: ${turnoCount}`);
    
    if (turnoCount > 0) {
      console.log('📝 Turnos activos:');
      const turnos = await turnosCollection.find({ online: true }).toArray();
      turnos.forEach((turno, index) => {
        console.log(`   ${index + 1}. Usuario: ${turno.username}`);
        console.log(`      Inicio: ${turno.inicio}`);
        console.log(`      Online: ${turno.online}`);
        console.log('');
      });
    }
    
    await client.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testLogin();
