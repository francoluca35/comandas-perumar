import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    const {
      codigo,
      cliente,
      productos,
      metodoPago,
      total,
      estado,
      hora,
      fecha,
    } = await req.json();

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});

    let tipo = null;

    if (mesasDoc.mesaAdentro?.some((m) => m.codigo === codigo)) {
      tipo = "mesaAdentro";
    } else if (mesasDoc.mesaAdentro2?.some((m) => m.codigo === codigo)) {
      tipo = "mesaAdentro2";
    } else if (mesasDoc.mesaAfuera?.some((m) => m.codigo === codigo)) {
      tipo = "mesaAfuera";
    } else {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    const mesasActualizadas = mesasDoc[tipo].map((mesa) =>
      mesa.codigo === codigo
        ? {
            ...mesa,
            cliente,
            productos,
            metodoPago,
            total,
            estado,
            hora,
            fecha,
          }
        : mesa
    );

    await db
      .collection("tables")
      .updateOne(
        { _id: mesasDoc._id },
        { $set: { [tipo]: mesasActualizadas } }
      );

    await db.collection("datos_clientes").insertOne({
      fecha: new Date().toLocaleDateString("es-AR"),
      cliente,
      comida: productos
        .filter((p) => p.tipo !== "bebida")
        .map((p) => p.nombre)
        .join(", "),
      bebida: productos
        .filter((p) => p.tipo === "bebida")
        .map((p) => p.nombre)
        .join(", "),
      total,
      metodoPago,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
