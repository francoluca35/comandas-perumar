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

    // Buscar en mesaAdentro y mesaAfuera
    const esAdentro = mesasDoc.mesaAdentro.some((m) => m.codigo === codigo);
    const tipo = esAdentro ? "mesaAdentro" : "mesaAfuera";

    // Actualizar la mesa dentro del array
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

    // Guardar el documento actualizado
    await db.collection("tables").updateOne(
      { _id: mesasDoc._id },
      {
        $set: {
          [tipo]: mesasActualizadas,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error actualizando mesa:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const mesas = await db.collection("tables").find({}).toArray();

    return NextResponse.json(mesas);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las mesas" },
      { status: 500 }
    );
  }
}
// Después de actualizar la mesa y enviar a cocina

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
  timestamp: new Date(), // Para borrar después de 35 días
});
