# 🔧 Troubleshooting: Error de Impresión

## ❌ **Error Actual**
```
Error: Error al imprimir
    at imprimirTicket (webpack-internal:///(app-pages-browser)/./app/screenhome/page.jsx:123:23)
```

## 🔍 **Diagnóstico Paso a Paso**

### 1. **Verificar Conectividad de Red**

```bash
# Verificar si la impresora responde
ping 192.168.1.100

# Verificar si el puerto está abierto
telnet 192.168.1.100 9100
```

**Resultado esperado:**
- `ping` debe responder con tiempos de respuesta
- `telnet` debe conectarse (pantalla en blanco = conexión exitosa)

### 2. **Verificar Configuración de Impresora**

```bash
# En Windows
ipconfig /all

# En Linux/Mac
ifconfig
```

**Verificar que:**
- Tu PC esté en la misma red que la impresora
- La IP de la impresora sea accesible desde tu PC

### 3. **Probar Conexión Manual**

Crea un archivo `test-printer.js`:

```javascript
const net = require('net');

const IP_COCINA = "192.168.1.100";
const PUERTO = 9100;

console.log(`🔍 Probando conexión a ${IP_COCINA}:${PUERTO}`);

const socket = new net.Socket();

socket.connect(PUERTO, IP_COCINA, () => {
  console.log('✅ Conexión exitosa!');
  socket.end();
});

socket.on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
});

socket.on('close', () => {
  console.log('🔌 Conexión cerrada');
});
```

Ejecuta: `node test-printer.js`

### 4. **Verificar Logs del Servidor**

En la consola de Next.js, busca estos mensajes:
- `✅ Ticket impreso: Ticket enviado a 192.168.1.100`
- `❌ Error al imprimir ticket: [detalles]`

### 5. **Problemas Comunes y Soluciones**

#### **Problema: "ECONNREFUSED"**
```
Error: connect ECONNREFUSED 192.168.1.100:9100
```

**Solución:**
1. Verificar que la impresora esté encendida
2. Verificar que la IP sea correcta
3. Verificar que el puerto 9100 esté habilitado

#### **Problema: "ENOTFOUND"**
```
Error: getaddrinfo ENOTFOUND 192.168.1.100
```

**Solución:**
1. Verificar conectividad de red
2. Verificar configuración DNS
3. Probar con IP directa

#### **Problema: "ETIMEDOUT"**
```
Error: connect ETIMEDOUT 192.168.1.100:9100
```

**Solución:**
1. Verificar firewall
2. Verificar que la impresora esté en la misma red
3. Probar con cable de red directo

## 🛠️ **Soluciones Rápidas**

### **Opción 1: Cambiar IP de Impresora**
Si tu impresora tiene una IP diferente, modifica en `app/api/print-payment/route.js`:

```javascript
const IP_COCINA = "192.168.1.XXX"; // Cambiar por tu IP real
```

### **Opción 2: Usar IP Local**
Si la impresora está conectada por USB, usa:

```javascript
const IP_COCINA = "127.0.0.1"; // Localhost
```

### **Opción 3: Verificar Puerto**
Algunas impresoras usan puertos diferentes:

```javascript
const PUERTO = 9100; // Probar con 9101, 9102, etc.
```

## 📋 **Checklist de Verificación**

- [ ] Impresora encendida y conectada a la red
- [ ] IP de impresora correcta (192.168.1.100)
- [ ] Puerto 9100 abierto y accesible
- [ ] PC en la misma red que la impresora
- [ ] Firewall no bloquea la conexión
- [ ] Cable de red funcionando correctamente

## 🎯 **Prueba Final**

1. **Ejecuta el test de conectividad:**
   ```bash
   node test-printer.js
   ```

2. **Si funciona, prueba la impresión:**
   - Paga con efectivo
   - Presiona "Imprimir ticket"
   - Debería imprimir automáticamente

3. **Si no funciona, verifica:**
   - Logs en la consola del navegador
   - Logs en la consola de Next.js
   - Estado de la impresora

## 📞 **Soporte Adicional**

Si el problema persiste, proporciona:
1. Resultado del `ping 192.168.1.100`
2. Resultado del `telnet 192.168.1.100 9100`
3. Logs de error completos
4. Modelo exacto de la impresora
5. Configuración de red actual
