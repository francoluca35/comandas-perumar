import { NextResponse } from "next/server";

// URL del servidor Express (cambiar según el entorno)
const PRINT_SERVER_URL = process.env.PRINT_SERVER_URL || "https://suited-diverse-wolf.ngrok-free.app";

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
  ticket += normal + "cant   producto                    precio\n";
  for (const nombre in productosAgrupados) {
    const item = productosAgrupados[nombre];
    const precioUnitario = item.precio || 0;
    const precioTotal = precioUnitario * item.cantidad;
    ticket += doble + `${item.cantidad} ${nombre.padEnd(25)} $${precioTotal.toFixed(2)}\n`;
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
      
      // Sumar a la caja registradora solo cuando se imprime el ticket
      if (metodoPago.toLowerCase() === "efectivo") {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/caja/sumar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ total: total }),
          });
          console.log("✅ Monto sumado a caja registradora:", total);
        } catch (cajaError) {
          console.error("❌ Error al sumar a caja:", cajaError);
        }
      }
      
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
