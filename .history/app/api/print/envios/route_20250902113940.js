import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://suited-diverse-wolf.ngrok-free.app/print-delivery", // Ruta específica del servidor local
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      const data = await response.text();
      
      // Sumar a la caja registradora solo cuando se imprime el ticket y es efectivo
      if (body.metodoPago && body.metodoPago.toLowerCase() === "efectivo") {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/caja/sumar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ total: body.total }),
          });
          console.log("✅ Monto sumado a caja registradora:", body.total);
        } catch (cajaError) {
          console.error("❌ Error al sumar a caja:", cajaError);
        }
      }
      
      return NextResponse.json({ success: true, message: data });
    } else {
      throw new Error(`Error del servidor: ${response.status}`);
    }
  } catch (err) {
    console.error("Error al conectar con servidor local:", err);
    return NextResponse.json(
      { error: "Error al imprimir desde Vercel" },
      { status: 500 }
    );
  }
}
