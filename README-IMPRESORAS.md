# Configuración de Impresoras Térmicas

## 🖨️ Configuración Actual

El sistema está configurado para usar impresoras de red con las siguientes configuraciones:

### Archivo de Configuración
- **Archivo**: `config-impresoras.js`
- **IP Cocina**: `192.168.1.100`
- **IP Parrilla**: `192.168.1.101`
- **Puerto**: `9100`
- **URL Ngrok**: `https://suited-diverse-wolf.ngrok-free.app`

## 🔧 Pasos para Configurar

### 1. Encontrar la IP de tu Impresora

#### Opción A: Desde la Impresora
1. Imprime una página de configuración desde la impresora
2. Busca la sección "Network" o "Red"
3. Anota la dirección IP

#### Opción B: Escáner de Red
1. Descarga [Advanced IP Scanner](https://www.advanced-ip-scanner.com/)
2. Escanea tu red local
3. Busca dispositivos con el nombre de tu impresora

#### Opción C: Configuración de Red
1. Accede al panel de control de la impresora
2. Ve a Configuración > Red
3. Anota la dirección IP

### 2. Actualizar Configuración

Edita el archivo `config-impresoras.js`:

```javascript
module.exports = {
  IP_COCINA: "192.168.1.XXX",     // IP real de tu impresora de cocina
  IP_PARRILLA: "192.168.1.XXX",   // IP real de tu impresora de parrilla
  PUERTO: 9100,                    // Puerto estándar (no cambiar)
  NGROK_URL: "https://suited-diverse-wolf.ngrok-free.app",
  PUERTO_LOCAL: 4000
};
```

### 3. Verificar Conexión

1. Asegúrate de que tu impresora esté en la misma red que tu computadora
2. Haz ping a la IP de la impresora:
   ```bash
   ping 192.168.1.XXX
   ```

### 4. Reiniciar Servidor

Después de cambiar la configuración:

```bash
# Detener el servidor (Ctrl+C)
# Luego volver a ejecutar:
node server-express-completo.js
```

## 🚨 Solución de Problemas

### Error: "No se pudo imprimir"
- Verifica que la IP sea correcta
- Asegúrate de que la impresora esté encendida y conectada a la red
- Verifica que el puerto 9100 esté abierto

### Error: "Connection refused"
- La impresora no está en esa IP
- El puerto está bloqueado por firewall
- La impresora no soporta conexiones de red

### Error: "Timeout"
- La impresora está muy lejos de la red
- Problemas de conectividad de red
- La impresora está ocupada procesando otro trabajo

## 📱 Acceso Externo

El sistema está configurado para usar ngrok en:
`https://suited-diverse-wolf.ngrok-free.app`

Si cambias la URL de ngrok, actualiza también:
- `config-impresoras.js`
- `app/api/print-payment/route.js`

## 🔍 Verificar Funcionamiento

1. Abre el navegador y ve a: `http://localhost:4000`
2. Deberías ver: "🖨️ Servidor local de impresión corriendo en http://localhost:4000"
3. Intenta imprimir un ticket de prueba
4. Verifica que aparezca en la consola: "✅ Ticket impreso: [mensaje]"

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del servidor para errores
2. Verifica la configuración de red de la impresora
3. Asegúrate de que la impresora soporte conexiones TCP/IP
