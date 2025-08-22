// Script para actualizar la URI de MongoDB
// Reemplaza las credenciales en los archivos necesarios

const fs = require('fs');
const path = require('path');

// Nueva URI de MongoDB (reemplaza con tus credenciales actuales)
const newMongoURI = "mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";

console.log('🔧 Actualizando URI de MongoDB...');

// Archivos a actualizar
const filesToUpdate = [
  'next.config.mjs',
  'test-db.js',
  'test-login.js',
  'test-register-connection.js'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (fs.existsSync(filePath)) {
    console.log(`📝 Actualizando ${file}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar la URI antigua con la nueva
    const oldURI = "mongodb+srv://deamoncompany18:Ek6Y58VSLxtAcx7x@cluster0.enk7rhv.mongodb.net/comandas?retryWrites=true&w=majority";
    
    if (content.includes(oldURI)) {
      content = content.replace(new RegExp(oldURI.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newMongoURI);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file} actualizado`);
    } else {
      console.log(`⚠️ URI no encontrada en ${file}`);
    }
  } else {
    console.log(`❌ Archivo ${file} no encontrado`);
  }
});

console.log('\n📋 Pasos para completar la configuración:');
console.log('1. Ve a MongoDB Atlas → Database Access');
console.log('2. Crea un nuevo usuario de base de datos o verifica las credenciales existentes');
console.log('3. Copia la nueva URI de conexión');
console.log('4. Reemplaza "TU_USUARIO" y "TU_PASSWORD" en este script con tus credenciales reales');
console.log('5. Ejecuta este script nuevamente');
console.log('6. Prueba el registro de usuarios');
