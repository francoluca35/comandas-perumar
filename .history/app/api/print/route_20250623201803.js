import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { mesa, productos, orden, hora, fecha, metodoPago } =
      await req.json();

    const response = await fetch("http://192.168.0.21:4000/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mesa,
        productos,
        orden,
        hora,
        fecha,
        metodoPago,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Respuesta del servidor local:", errText);
      return NextResponse.json(
        { error: "Fallo al enviar al servidor local" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, results: data });
  } catch (error) {
    console.error("Error general:", error);
    return NextResponse.json({ error: "Error en impresión" }, { status: 500 });
  }
}
