// Script de prueba para verificar la impresión
const config = require('./config-impresoras');

async function testImpresion() {
  console.log('🧪 Probando sistema de impresión...');
  console.log('📋 Configuración actual:');
  console.log(`   - IP Cocina: ${config.IP_COCINA}`);
  console.log(`   - IP Parrilla: ${config.IP_PARRILLA}`);
  console.log(`   - Puerto: ${config.PUERTO}`);
  console.log(`   - URL Ngrok: ${config.NGROK_URL}`);
  
  // Datos de prueba
  const datosPrueba = {
    mesa: "TEST",
    productos: [
      { nombre: "Hamburguesa", precio: 15.00, cantidad: 2, observacion: "Sin cebolla" },
      { nombre: "Papas Fritas", precio: 8.00, cantidad: 1 },
      { nombre: "Coca Cola", precio: 5.00, cantidad: 2 }
    ],
    total: 51.00,
    metodoPago: "Efectivo",
    nombreCliente: "Cliente Prueba",
    propina: 0,
    descuento: 0
  };
  
  console.log('\n📝 Datos de prueba:');
  console.log(JSON.stringify(datosPrueba, null, 2));
  
  try {
    // Probar conexión a la API local
    console.log('\n🔌 Probando conexión a API local...');
    const response = await fetch(`http://localhost:4000/print-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPrueba)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API local funcionando:', data.message);
    } else {
      console.log('❌ Error en API local:', response.status);
    }
  } catch (err) {
    console.log('❌ No se pudo conectar a API local:', err.message);
    console.log('💡 Asegúrate de que el servidor Express esté corriendo:');
    console.log('   node server-express-completo.js');
  }
  
  try {
    // Probar conexión a la API de Next.js
    console.log('\n🌐 Probando conexión a API Next.js...');
    const response = await fetch(`/api/print-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPrueba)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Next.js funcionando:', data.message);
    } else {
      console.log('❌ Error en API Next.js:', response.status);
    }
  } catch (err) {
    console.log('❌ No se pudo conectar a API Next.js:', err.message);
  }
  
  console.log('\n📋 Resumen de la prueba:');
  console.log('1. Verifica que las IPs de las impresoras sean correctas');
  console.log('2. Asegúrate de que las impresoras estén encendidas y conectadas a la red');
  console.log('3. Verifica que el servidor Express esté corriendo en puerto 4000');
  console.log('4. Revisa la consola del servidor para errores de conexión');
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
  testImpresion().catch(console.error);
}

module.exports = { testImpresion };
