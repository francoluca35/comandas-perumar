import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function DELETE(req) {
  try {
    const { tipo, cantidad } = await req.json();

    if (!tipo || !cantidad || cantidad <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const mesasDoc = await db.collection("tables").findOne({});
    const mesas = mesasDoc[tipo];

    if (!Array.isArray(mesas)) {
      return NextResponse.json(
        { error: "Tipo de mesa no válido" },
        { status: 400 }
      );
    }

    // Eliminar las últimas X mesas
    const nuevasMesas = mesas.slice(0, Math.max(0, mesas.length - cantidad));

    await db
      .collection("tables")
      .updateOne({ _id: mesasDoc._id }, { $set: { [tipo]: nuevasMesas } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar por cantidad:", error);
    return NextResponse.json(
      { error: "Error al eliminar mesas por cantidad" },
      { status: 500 }
    );
  }
}
