const express = require("express");
const cors = require("cors");
const net = require("net");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const IP_COCINA = "192.168.1.100";
const IP_PARRILLA = "192.168.1.101";
const PUERTO = 9100;

// Función para enviar a impresora
function imprimirTicket(ip, contenido) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.connect(PUERTO, ip, () => {
      socket.write(contenido, "binary", () => {
        socket.end();
        resolve(`Ticket enviado a ${ip}`);
      });
    });
    socket.on("error", (err) => {
      reject(`Error al imprimir en ${ip}: ${err.message}`);
    });
  });
}

function generarTicketCocina({
  mesa,
  productos,
  orden,
  hora,
  fecha,
  metodoPago,
}) {
  const doble = "\x1D\x21\x11";
  const tercero = "\x1D\x21\x01";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";
  const negrita = "\x1B\x45\x01";

  const titulo = productos.every((p) => p.categoria?.toLowerCase() === "brasas")
    ? "HORNO"
    : "COCINA";

  let ticket = "";
  ticket += doble + ` ${titulo}\n`;
  ticket += "======================\n";

  ticket += `MESA: ${mesa}\n`;
  ticket += normal;
  ticket += ` ORDEN: ${orden}\nHORA: ${hora}\nFECHA: ${fecha}\n`;
  ticket += doble + "======================\n";

  // Agrupar productos por nombre
  const productosAgrupados = productos.reduce((acc, p) => {
    const nombre = p.nombre.toUpperCase();
    if (!acc[nombre]) {
      acc[nombre] = { ...p, cantidad: p.cantidad || 1 };
    } else {
      acc[nombre].cantidad += p.cantidad || 1;
    }
    return acc;
  }, {});

  // Imprimir productos agrupados
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    ticket += normal + "cant   producto";
    ticket += "\n";
    ticket += doble + `${item.cantidad} ${nombre}\n`;
    // Observación (si hay)
    if (item.observacion && item.observacion.trim() !== "") {
      ticket += negrita + tercero + `(${item.observacion.trim()})\n`;
    }
    // Adicionales (si hay)
    if (item.adicionales && item.adicionales.length > 0) {
      ticket += normal + ` + ${item.adicionales.join(", ")}\n`;
    }
  }
  ticket += "\n\n";
  ticket += "  ==========================\n";
  ticket += "\n\n\n" + cortar;
  return ticket;
}

// 🧾 Generador de ticket delivery o mostrador
function generarTicketDelivery({ nombre, direccion, productos, total, modo, observacion }) {
  const doble = "\x1D\x21\x11";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";
  const tercero = "\x1D\x21\x01";
  const negrita = "\x1B\x45\x01";

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fecha = ahora.toLocaleDateString("es-AR");
  const orden = Math.floor(Math.random() * 1000000000000); // genera orden aleatoria
  const encabezado = modo === "retiro" ? "PARA LLEVAR" : "DELIVERY";

  let ticket = "";
  ticket += doble + `     ${encabezado}\n`;
  ticket += "======================\n";
  ticket += doble;
  ticket += `Cliente: ${nombre}\n`;
  if (direccion) ticket += `Direccion: ${direccion}\n`;
  ticket += normal;
  ticket += `ORDEN: ${orden}\n`;
  ticket += `HORA: ${hora}\n`;
  ticket += `FECHA: ${fecha}\n`;
  ticket += doble + "======================\n";

  // Agrupar productos
  const productosAgrupados = productos.reduce((acc, p) => {
    const nombre = p.nombre.toUpperCase();
    if (!acc[nombre]) {
      acc[nombre] = { ...p, cantidad: p.cantidad || 1 };
    } else {
      acc[nombre].cantidad += p.cantidad || 1;
    }
    return acc;
  }, {});

  ticket += normal + "cant   producto\n";
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    ticket += doble + `${item.cantidad} ${nombre}\n`;
    // Observación (si hay)
    if (item.observacion && item.observacion.trim() !== "") {
      ticket += negrita + tercero + `(${item.observacion.trim()})\n`;
    }
    // Adicionales (si hay)
    if (item.adicionales && item.adicionales.length > 0) {
      ticket += normal + `   + ${item.adicionales.join(", ")}\n`;
    }
  }  
  
  // Observación general del pedido
  if (observacion && observacion.trim() !== "") {
    ticket += "\n";
    ticket += doble + "OBSERVACIÓN GENERAL:\n";
    ticket += normal + `${observacion.trim()}\n`;
  }
  
  ticket += "\n\n";
  ticket += `TOTAL:  $${total} \n`;
  ticket += doble + "======================\n";
  ticket += normal;
  ticket += "\n\n\n";
  ticket += "==========================\n";
  ticket += cortar;

  return ticket;
}

// 🧾 Generador de ticket de pago
function generarTicketPago({ mesa, productos, total, metodoPago, nombreCliente, propina, descuento }) {
  const doble = "\x1D\x21\x11";
  const normal = "\x1D\x21\x00";
  const cortar = "\x1D\x56\x00";
  const tercero = "\x1D\x21\x01";
  const negrita = "\x1B\x45\x01";

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fecha = ahora.toLocaleDateString("es-AR");
  const orden = Math.floor(Math.random() * 1000000000000);

  let ticket = "";

  ticket += doble + `    PERUMAR\n`;
ticket += doble + `RESTO CELINA CITY\n`;  
ticket += "======================\n";
  ticket += normal;
  ticket += `MESA: ${mesa}\n`;
  ticket += `Cliente: ${nombreCliente || "Cliente"}\n`;
  ticket += `ORDEN: ${orden}\n`;
  ticket += `HORA: ${hora}\n`;
  ticket += `FECHA: ${fecha}\n`;
  ticket += doble + "======================\n";

  // Agrupar productos
  const productosAgrupados = productos.reduce((acc, p) => {
    const nombre = p.nombre.toUpperCase();
    if (!acc[nombre]) {
      acc[nombre] = { ...p, cantidad: p.cantidad || 1 };
    } else {
      acc[nombre].cantidad += p.cantidad || 1;
    }
    return acc;
  }, {});

  ticket += normal + "cant   producto\n";
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    const precioUnitario = item.precio || 0;
    ticket += doble + `${item.cantidad} ${nombre} $${precioUnitario.toFixed(2)}\n`;
    // Observación (si hay)
    if (item.observacion && item.observacion.trim() !== "") {
      ticket += negrita + tercero + `(${item.observacion.trim()})\n`;
    }
    // Adicionales (si hay)
    if (item.adicionales && item.adicionales.length > 0) {
      ticket += normal + `   + ${item.adicionales.join(", ")}\n`;
    }
  }

  ticket += "\n";
  ticket += doble + "======================\n";
  
  // Calcular subtotal
  const subtotal = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
  
  ticket += normal + `Subtotal: $${subtotal.toFixed(2)}\n`;
  
  // Descuento (si hay)
  if (descuento && descuento > 0) {
    ticket += `Descuento: -$${descuento.toFixed(2)}\n`;
  }
  
  // Propina (si hay)
  if (propina && propina > 0) {
    ticket += `Propina: $${propina.toFixed(2)}\n`;
  }
  
  ticket += doble + `TOTAL: $${total.toFixed(2)}\n`;
  ticket += `Método: ${metodoPago}\n`;
  ticket += "======================\n";
  ticket += normal;
  ticket += "\n\n";
  ticket += "   GRACIAS POR SU VISITA!\n";
ticket += "   Olavarria 2525, V. Celina\n";
ticket += "   Rivera 2495, V. Celina\n";
ticket += "   Telefono: 11 28665579";
ticket += "   Telefono: 11 22353820";
ticket += "\n\n";
  ticket += "==========================\n";
ticket += "==========================\n";
ticket += "==========================\n";
  ticket += cortar;

  return ticket;
}

// 📦 Ruta para pedidos restaurante
app.post("/print", async (req, res) => {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago, modo } = req.body;
    
    console.log("🔍 DEBUG - Productos recibidos:", productos.map(p => ({ 
      nombre: p.nombre, 
      categoria: p.categoria,
      categoriaLower: p.categoria?.toLowerCase(),
      esBrasas: p.categoria?.toLowerCase() === "brasas"
    })));
    
    // Verificar si hay productos brasas
    const tieneBrasas = productos.some(
      (p) => p.categoria?.toLowerCase() === "brasas"
    );
    
    console.log("🔍 DEBUG - ¿Tiene brasas?", tieneBrasas);
    console.log("🔍 DEBUG - Productos que son brasas:", productos.filter(p => p.categoria?.toLowerCase() === "brasas").map(p => p.nombre));

    const tareas = [];

    if (tieneBrasas) {
      console.log("🔥 IMPRIMIENDO BRASAS: 1 ticket en cocina + 1 ticket en parrilla");
      
      // Si el pedido tiene productos BRASAS: imprimir 1 ticket en cocina y 1 en parrilla
      const contenido = generarTicketCocina({
        mesa,
        productos,
        orden,
        hora,
        fecha,
        metodoPago,
      });
      
      // 1 ticket en cocina (192.168.1.100)
      console.log("📄 Enviando ticket a COCINA:", IP_COCINA);
      tareas.push(imprimirTicket(IP_COCINA, contenido));
      
      // 1 ticket en parrilla (192.168.1.101)
      console.log("📄 Enviando ticket a PARRILLA:", IP_PARRILLA);
      tareas.push(imprimirTicket(IP_PARRILLA, contenido));
    } else {
      console.log("🍽️ IMPRIMIENDO NO-BRASAS: 2 tickets iguales en cocina");
      
      // Si NO es brasas: imprimir 2 tickets iguales en cocina (192.168.1.100)
      const contenido = generarTicketCocina({
        mesa,
        productos,
        orden,
        hora,
        fecha,
        metodoPago,
      });
      
      // 2 tickets iguales en cocina
      console.log("📄 Enviando ticket 1 a COCINA:", IP_COCINA);
      tareas.push(imprimirTicket(IP_COCINA, contenido));
      console.log("📄 Enviando ticket 2 a COCINA:", IP_COCINA);
      tareas.push(imprimirTicket(IP_COCINA, contenido));
    }

    console.log("📋 Total de tareas de impresión:", tareas.length);

    const resultados = await Promise.allSettled(tareas);

    console.log("✅ Resultados de impresión:", resultados.map((r, i) => 
      r.status === "fulfilled" ? `Tarea ${i+1}: ${r.value}` : `Tarea ${i+1}: ${r.reason}`
    ));

    res.json({
      success: true,
      results: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason
      ),
    });
  } catch (err) {
    console.error("❌ Error en print:", err);
    res.status(500).json({ error: "Error al imprimir", message: err.message });
  }
});

app.post("/print-delivery", async (req, res) => {
  try {
    const { nombre, direccion, productos, total, modo, observacion } = req.body;

    console.log("🔍 DEBUG - Productos recibidos:", productos.map(p => ({ 
      nombre: p.nombre, 
      categoria: p.categoria,
      categoriaLower: p.categoria?.toLowerCase(),
      esBrasas: p.categoria?.toLowerCase() === "brasas"
    })));

    // Verificar si hay productos brasas
    const tieneBrasas = productos.some(
      (p) => p.categoria?.toLowerCase() === "brasas"
    );

    console.log("🔍 DEBUG - ¿Tiene brasas?", tieneBrasas);
    console.log("🔍 DEBUG - Productos que son brasas:", productos.filter(p => p.categoria?.toLowerCase() === "brasas").map(p => p.nombre));

    // Crear tareas de impresión
    const tareas = [];

    if (tieneBrasas) {
      console.log("🔥 IMPRIMIENDO BRASAS: 1 ticket en parrilla + 1 ticket en cocina");
      
      // Si el pedido tiene productos BRASAS: imprimir 1 ticket en parrilla y 1 en cocina
      const contenido = generarTicketDelivery({
        nombre,
        direccion,
        productos,
        total,
        modo,
        observacion,
      });
      
      // 1 ticket en parrilla (192.168.1.101)
      console.log("📄 Enviando ticket a PARRILLA:", IP_PARRILLA);
      tareas.push(imprimirTicket(IP_PARRILLA, contenido));
      
      // 1 ticket en cocina (192.168.1.100)
      console.log("📄 Enviando ticket a COCINA:", IP_COCINA);
      tareas.push(imprimirTicket(IP_COCINA, contenido));
    } else {
      console.log("🍽️ IMPRIMIENDO NO-BRASAS: 2 tickets iguales en cocina");
      
      // Si NO es brasas: imprimir 2 tickets iguales en cocina (192.168.1.100)
      const contenido = generarTicketDelivery({
        nombre,
        direccion,
        productos,
        total,
        modo,
        observacion,
      });
      
      // 2 tickets iguales en cocina
      console.log("📄 Enviando ticket 1 a COCINA:", IP_COCINA);
      tareas.push(imprimirTicket(IP_COCINA, contenido));
      console.log("📄 Enviando ticket 2 a COCINA:", IP_COCINA);
      tareas.push(imprimirTicket(IP_COCINA, contenido));
    }

    console.log("📋 Total de tareas de impresión:", tareas.length);

    const resultados = await Promise.allSettled(tareas);

    console.log("✅ Resultados de impresión:", resultados.map((r, i) => 
      r.status === "fulfilled" ? `Tarea ${i+1}: ${r.value}` : `Tarea ${i+1}: ${r.reason}`
    ));

    res.json({
      success: true,
      results: resultados.map((r) =>
        r.status === "fulfilled" ? r.value : r.reason
      ),
    });
  } catch (err) {
    console.error("❌ Error en print-delivery:", err);
    res.status(500).json({ error: "Error en impresión", message: err.message });
  }
});


app.listen(PORT, () => {
  console.log(
    `🖨️  Servidor local de impresión corriendo en http://localhost:${PORT}`
  );
});

process.on("uncaughtException", (err) => {
  console.error("❌ Excepción no atrapada:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Rechazo de promesa no manejado:", reason);
});