const net = require('net');

const IP_COCINA = "192.168.1.100";
const PUERTO = 9100;

console.log(`🔍 Probando conexión a ${IP_COCINA}:${PUERTO}`);

const socket = new net.Socket();

socket.connect(PUERTO, IP_COCINA, () => {
  console.log('✅ Conexión exitosa!');
  console.log('📡 Impresora respondiendo correctamente');
  socket.end();
});

socket.on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
  
  if (err.code === 'ECONNREFUSED') {
    console.log('💡 Solución: Verificar que la impresora esté encendida y la IP sea correcta');
  } else if (err.code === 'ENOTFOUND') {
    console.log('💡 Solución: Verificar conectividad de red y configuración DNS');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('💡 Solución: Verificar firewall y que esté en la misma red');
  }
});

socket.on('close', () => {
  console.log('🔌 Conexión cerrada');
});

// Timeout después de 5 segundos
setTimeout(() => {
  if (!socket.destroyed) {
    console.log('⏰ Timeout: No se pudo conectar en 5 segundos');
    socket.destroy();
  }
}, 5000);
