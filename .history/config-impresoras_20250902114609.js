// Configuración de impresoras térmicas
// Cambia estas IPs por las IPs reales de tus impresoras

module.exports = {
  // IP de la impresora de cocina
  IP_COCINA: "192.168.1.100",
  
  // IP de la impresora de parrilla/horno
  IP_PARRILLA: "192.168.1.101",
  
  // Puerto estándar para impresoras térmicas
  PUERTO: 9100,
  
  // URL del servidor ngrok (para acceso externo)
  NGROK_URL: "https://suited-diverse-wolf.ngrok-free.app",
  
  // Puerto local del servidor Express
  PUERTO_LOCAL: 4000
};

// Para encontrar la IP de tu impresora:
// 1. Imprime una página de configuración desde la impresora
// 2. O revisa la configuración de red de la impresora
// 3. O usa un escáner de red como Advanced IP Scanner
