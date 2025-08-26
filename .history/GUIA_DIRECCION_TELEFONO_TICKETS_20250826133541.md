# 📍 Guía: Dirección y Teléfono en Tickets

## ✅ **Cambios Realizados**

Se ha agregado la información de contacto del restaurante a los tickets de **delivery** y **pago**.

### 📋 **Información Agregada:**
- **Dirección:** olavarria 2525 V. Celina
- **Teléfono:** 1128665579

## 🔧 **Archivos Modificados**

### 1. **`app/api/print-payment/route.js`**
- ✅ Agregada dirección y teléfono al ticket de pago
- ✅ Se imprime al final del ticket, antes de cortar

### 2. **`server-express-completo.js`** (nuevo archivo)
- ✅ Código completo del servidor Express
- ✅ Incluye dirección y teléfono en tickets de delivery y pago
- ✅ Listo para usar con `node server-express-completo.js`

## 📄 **Formato de los Tickets**

### **Ticket de Pago:**
```
     PERÚ MAR
======================
MESA: [número]
Cliente: [nombre]
ORDEN: [número]
HORA: [hora]
FECHA: [fecha]
======================
cant   producto
[lista de productos]
======================
Subtotal: $[subtotal]
TOTAL: $[total]
Método: [método de pago]
======================
   ¡GRACIAS POR SU VISITA!
==========================
olavarria 2525 V. Celina
Tel: 1128665579
```

### **Ticket de Delivery:**
```
     DELIVERY
======================
Cliente: [nombre]
Direccion: [dirección]
ORDEN: [número]
HORA: [hora]
FECHA: [fecha]
======================
cant   producto
[lista de productos]
======================
TOTAL: $[total]
======================
==========================
olavarria 2525 V. Celina
Tel: 1128665579
```

## 🚀 **Para Usar el Servidor Express**

### **Opción 1: Usar el archivo completo**
```bash
# Guardar como server-express-completo.js
node server-express-completo.js
```

### **Opción 2: Usar tu archivo actual**
Agregar estas líneas al final de las funciones `generarTicketDelivery` y `generarTicketPago`:

```javascript
// En generarTicketDelivery, antes del cortar:
ticket += "==========================\n";
ticket += "olavarria 2525 V. Celina\n";
ticket += "Tel: 1128665579\n";
ticket += cortar;

// En generarTicketPago, antes del cortar:
ticket += "==========================\n";
ticket += "olavarria 2525 V. Celina\n";
ticket += "Tel: 1128665579\n";
ticket += cortar;
```

## 🎯 **Resultado Final**

Ahora todos los tickets incluyen:
- ✅ **Información del restaurante**
- ✅ **Dirección completa**
- ✅ **Número de teléfono**
- ✅ **Formato profesional**

## 📞 **Información de Contacto**

- **Dirección:** olavarria 2525 V. Celina
- **Teléfono:** 1128665579

## 🔄 **Próximos Pasos**

1. **Ejecutar el servidor:**
   ```bash
   node server-express-completo.js
   ```

2. **Probar la impresión:**
   - Paga con efectivo
   - Presiona "Imprimir ticket"
   - Verificar que aparezca la dirección y teléfono

3. **Probar delivery:**
   - Crear pedido delivery
   - Verificar que aparezca la información de contacto

¡Los tickets ahora incluyen toda la información de contacto del restaurante! 🎉
