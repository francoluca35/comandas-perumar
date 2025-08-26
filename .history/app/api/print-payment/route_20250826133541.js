import { NextResponse } from "next/server";
import net from "net";

const IP_COCINA = "192.168.1.100";
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

// Generador de ticket de pago
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
  ticket += doble + `     PERÚ MAR\n`;
  ticket += "======================\n";
  ticket += normal;
  ticket += `MESA: ${mesa}\n`;
  ticket += `Cliente: ${nombreCliente}\n`;
  ticket += `ORDEN: ${orden}\n`;
  ticket += `HORA: ${hora}\n`;
  ticket += `FECHA: ${fecha}\n`;
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
    ticket += normal + "cant   producto\n";
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

  ticket += "\n";
  ticket += "======================\n";
  ticket += normal;
  ticket += `Subtotal: $${(total - propina + descuento).toFixed(2)}\n`;
  if (propina > 0) {
    ticket += `Propina: $${propina.toFixed(2)}\n`;
  }
  if (descuento > 0) {
    ticket += `Descuento: -$${descuento.toFixed(2)}\n`;
  }
  ticket += doble + `TOTAL: $${total.toFixed(2)}\n`;
  ticket += normal + `Método: ${metodoPago}\n`;
  ticket += "======================\n";
  ticket += "   ¡GRACIAS POR SU VISITA!\n";
  ticket += "==========================\n";
  ticket += "olavarria 2525 V. Celina\n";
  ticket += "Tel: 1128665579\n";
  ticket += "\n\n\n" + cortar;
  
  return ticket;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { mesa, productos, total, metodoPago, nombreCliente, propina, descuento } = body;

    // Generar el ticket
    const contenidoTicket = generarTicketPago({
      mesa,
      productos,
      total,
      metodoPago,
      nombreCliente: nombreCliente || "Cliente",
      propina: propina || 0,
      descuento: descuento || 0,
    });

    // Enviar a la impresora
    const resultado = await imprimirTicket(IP_COCINA, contenidoTicket);
    
    console.log("✅ Ticket impreso:", resultado);
    
    return NextResponse.json({ 
      success: true, 
      message: resultado,
      data: { mesa, total, metodoPago }
    });
    
  } catch (err) {
    console.error("❌ Error al imprimir ticket:", err);
    return NextResponse.json(
      { 
        error: "Error al imprimir ticket de pago",
        details: err.message 
      },
      { status: 500 }
    );
  }
}
