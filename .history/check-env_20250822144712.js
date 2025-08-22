// Script para verificar qué MONGODB_URI está usando la aplicación
console.log('🔍 Verificando variables de entorno...');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'No definida');

// Cargar desde .env.local manualmente
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n📄 Contenido de .env.local:');
  lines.forEach((line, index) => {
    if (line.startsWith('MONGODB_URI')) {
      console.log(`Línea ${index + 1}: ${line}`);
    }
  });
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message);
}
