# 🧾 Guía: Ticket de Pago en Impresora Térmica

## ✅ **Funcionalidad Implementada**

Se ha agregado la funcionalidad para imprimir tickets de pago en la impresora térmica de la cocina cuando se confirma un pago.

## 🔧 **Cambios Realizados**

### 1. **Servidor Express (printdelivery/route.js)**
- ✅ Agregada función `generarTicketPago()` que crea el formato ESC/POS para el ticket
- ✅ Agregada ruta `/print-payment` que recibe los datos y envía a la impresora
- ✅ El ticket se imprime en la impresora de **COCINA** (`IP_COCINA = "192.168.1.100"`)

### 2. **API Route (app/api/print-payment/route.js)**
- ✅ Nueva ruta que conecta Next.js con el servidor de impresión
- ✅ Reenvía las peticiones al servidor Express en `localhost:4000`

### 3. **Componente CobrarCuentaModal.jsx**
- ✅ Modificado para usar la nueva ruta de impresión térmica
- ✅ Envía todos los datos necesarios: mesa, productos, total, método de pago, etc.

## 📋 **Formato del Ticket de Pago**

El ticket incluye:
```
     PERÚ MAR
======================
MESA: [número]
Cliente: [nombre]
ORDEN: [número aleatorio]
HORA: [hora actual]
FECHA: [fecha actual]
======================
cant   producto
[lista de productos con cantidades]
======================
Subtotal: $[subtotal]
Descuento: -$[descuento] (si hay)
Propina: $[propina] (si hay)
TOTAL: $[total final]
Método: [método de pago]
======================
   ¡GRACIAS POR SU VISITA!
==========================
```

## 🚀 **Cómo Funciona**

1. **Usuario confirma pago** → Se ejecuta `confirmarPago()`
2. **Se envía petición** → `/api/print-payment` con datos del pedido
3. **API reenvía** → Al servidor Express en `localhost:4000/print-payment`
4. **Servidor genera** → Formato ESC/POS para impresora térmica
5. **Se imprime** → En la impresora de cocina (`192.168.1.100:9100`)

## 🔗 **Flujo de Datos**

```
CobrarCuentaModal.jsx
        ↓
/api/print-payment/route.js
        ↓
Servidor Express (localhost:4000)
        ↓
Impresora Térmica (192.168.1.100:9100)
```

## ⚙️ **Configuración Requerida**

### Variables de Entorno
```env
PRINT_SERVER_URL=http://localhost:4000
```

### IPs de Impresoras (en el servidor Express)
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
  total: "total final con comisión",
  metodoPago: "Mercado Pago/Efectivo/etc",
  nombreCliente: "nombre del cliente",
  propina: 0, // opcional
  descuento: "monto de descuento" // opcional
}
```

## ✅ **Ventajas**

1. **Separación de responsabilidades**: El ticket de pago se imprime independientemente
2. **Formato profesional**: Ticket con formato ESC/POS estándar
3. **Datos completos**: Incluye todos los detalles del pedido
4. **Fácil mantenimiento**: Código modular y bien organizado

## 🔍 **Troubleshooting**

### Si no imprime:
1. Verificar que el servidor Express esté corriendo en puerto 4000
2. Verificar conectividad con la impresora (`192.168.1.100:9100`)
3. Revisar logs del servidor Express
4. Verificar que la variable `PRINT_SERVER_URL` esté configurada

### Si imprime mal formato:
1. Verificar comandos ESC/POS en `generarTicketPago()`
2. Ajustar ancho de línea según impresora
3. Verificar codificación de caracteres

## 🎉 **Resultado Final**

Ahora cuando confirmes un pago, el ticket se imprimirá automáticamente en la impresora térmica de la cocina con un formato profesional y todos los detalles del pedido.
