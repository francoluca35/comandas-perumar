import { NextResponse } from "next/server";

// URL del servidor Express (cambiar según el entorno)
const PRINT_SERVER_URL = process.env.PRINT_SERVER_URL || "http://localhost:4000";

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
  ticket += doble + `     RESTO CELINA CITY\n`;
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

    // Enviar al servidor Express
    const response = await fetch(`${PRINT_SERVER_URL}/print-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesa,
        productos,
        total,
        metodoPago,
        nombreCliente: nombreCliente || "Cliente",
        propina: propina || 0,
        descuento: descuento || 0,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Ticket impreso:", data.message);
      
      return NextResponse.json({ 
        success: true, 
        message: data.message,
        data: { mesa, total, metodoPago }
      });
    } else {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
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
