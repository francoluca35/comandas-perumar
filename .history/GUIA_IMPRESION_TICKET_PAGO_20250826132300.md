# 🧾 Guía: Impresión Automática de Tickets de Pago

## ✅ **Problema Solucionado**

Antes: El botón "Imprimir ticket" generaba un PDF en lugar de enviar a la impresora térmica.
Ahora: El botón "Imprimir ticket" envía directamente a la impresora térmica POS-80.

## 🔧 **Cambios Realizados**

### 1. **Modificado `app/screenhome/page.jsx`**
- ✅ Reemplazada la función `imprimirTicket()` que generaba PDF
- ✅ Ahora envía datos a `/api/print-payment` para impresión térmica
- ✅ Agregado import de `Swal` para notificaciones
- ✅ Agregada confirmación visual cuando se imprime correctamente

### 2. **Servidor Express (tu archivo `index.js`)**
- ✅ Función `generarTicketPago()` - Genera formato ESC/POS
- ✅ Ruta `/print-payment` - Recibe datos y envía a impresora
- ✅ Imprime en la impresora de **COCINA** (`192.168.1.100:9100`)

### 3. **API Route (`app/api/print-payment/route.js`)**
- ✅ Conecta Next.js con el servidor Express
- ✅ Reenvía peticiones al servidor en `localhost:4000`

## 🚀 **Flujo Completo**

```
1. Usuario paga con efectivo
   ↓
2. Se guarda ticket en Firebase (estado: "pendiente")
   ↓
3. Aparece "Ticket pendiente" en pantalla principal
   ↓
4. Usuario presiona "🖨️ Imprimir ticket"
   ↓
5. Se envía a /api/print-payment
   ↓
6. Se reenvía al servidor Express (localhost:4000)
   ↓
7. Se imprime en impresora térmica (192.168.1.100:9100)
   ↓
8. Se elimina ticket de Firebase
   ↓
9. Se muestra confirmación "Ticket impreso"
```

## 📋 **Formato del Ticket Impreso**

```
     PERÚ MAR
======================
MESA: [número]
Cliente: Cliente
ORDEN: [número aleatorio]
HORA: [hora actual]
FECHA: [fecha actual]
======================
cant   producto
[lista de productos con cantidades]
======================
Subtotal: $[subtotal]
TOTAL: $[total final]
Método: [método de pago]
======================
   ¡GRACIAS POR SU VISITA!
==========================
```

## ⚙️ **Configuración Requerida**

### 1. **Servidor Express**
```bash
# Ejecutar tu archivo index.js
node index.js
```

### 2. **Variables de Entorno**
```env
PRINT_SERVER_URL=http://localhost:4000
```

### 3. **IPs de Impresoras**
```javascript
const IP_COCINA = "192.168.1.100";  // Impresora para tickets de pago
const IP_PARRILLA = "192.168.1.101"; // Impresora para parrilla
const PUERTO = 9100;
```

## 🎯 **Datos que se Envían**

```javascript
{
  mesa: "número de mesa",
  productos: [array de productos],
  total: "total final",
  metodoPago: "Efectivo/Mercado Pago/etc",
  nombreCliente: "Cliente",
  propina: 0,
  descuento: 0
}
```

## ✅ **Ventajas de la Nueva Implementación**

1. **Impresión automática**: No más PDFs, impresión directa en térmica
2. **Formato profesional**: Ticket con formato ESC/POS estándar
3. **Confirmación visual**: Notificación cuando se imprime correctamente
4. **Limpieza automática**: Se elimina el ticket de Firebase después de imprimir
5. **Manejo de errores**: Mensajes claros si algo falla

## 🔍 **Troubleshooting**

### Si no imprime:
1. **Verificar servidor Express**: `node index.js` debe estar corriendo
2. **Verificar conectividad**: `ping 192.168.1.100`
3. **Verificar puerto**: `telnet 192.168.1.100 9100`
4. **Revisar logs**: Consola del servidor Express
5. **Verificar variable**: `PRINT_SERVER_URL=http://localhost:4000`

### Si imprime mal formato:
1. **Verificar comandos ESC/POS** en `generarTicketPago()`
2. **Ajustar ancho de línea** según impresora
3. **Verificar codificación** de caracteres

## 🎉 **Resultado Final**

Ahora cuando:
1. **Pagues con efectivo** → Se guarda ticket pendiente
2. **Presiones "Imprimir ticket"** → Se imprime automáticamente en la POS-80
3. **Se muestra confirmación** → "Ticket impreso correctamente"
4. **Se elimina de pendientes** → Ticket desaparece de la lista

¡La impresión es automática y directa a la impresora térmica! 🎯
