// Script para probar el endpoint de registro
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testRegisterEndpoint() {
  console.log('🧪 Probando endpoint de registro...');
  
  try {
    // Crear un archivo de imagen de prueba
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'test image content');
    
    // Crear FormData como lo haría el frontend
    const formData = new FormData();
    formData.append('username', 'testuser_' + Date.now());
    formData.append('email', 'test@example.com');
    formData.append('password', 'testpassword123');
    formData.append('nombreCompleto', 'Usuario de Prueba');
    formData.append('rol', 'delivery');
    formData.append('foto', fs.createReadStream(testImagePath), {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('📤 Enviando datos de registro...');
    
    // Simular la petición al endpoint
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('📥 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Data:', result);
    
    if (response.ok) {
      console.log('✅ Registro exitoso!');
    } else {
      console.log('❌ Error en el registro:', result.error);
    }
    
    // Limpiar archivo de prueba
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('❌ Error al probar el endpoint:', error.message);
  }
}

// Instrucciones para usar este script
console.log('📋 Para usar este script:');
console.log('1. Asegúrate de que tu aplicación Next.js esté corriendo en http://localhost:3000');
console.log('2. Verifica que las credenciales de MongoDB sean correctas');
console.log('3. Ejecuta: node test-register-endpoint.js');
console.log('');

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testRegisterEndpoint();
}
