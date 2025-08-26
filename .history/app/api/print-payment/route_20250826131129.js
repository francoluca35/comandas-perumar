import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const printServerUrl = process.env.PRINT_SERVER_URL || "http://localhost:4000";
    
    const response = await fetch(
      `${printServerUrl}/print-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json(
        { error: "Error al imprimir ticket de pago" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Error al conectar con servidor de impresión:", err);
    return NextResponse.json(
      { error: "Error al imprimir ticket de pago" },
      { status: 500 }
    );
  }
}
