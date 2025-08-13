import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export const { default: clientPromise } = await import("@/lib/mongodb");

async function PUT(req) {
  try {
    const { id, nombre, precio, precioConIVA, descuento, adicionales } =
      await req.json();

    if (!id || !nombre || !precio || !precioConIVA) {
      return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const update = {
      nombre,
      precio,
      precioConIVA,
      adicionales,
      ...(descuento !== undefined && { descuento }),
    };

    await db
      .collection("menus")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ message: "Menú actualizado" }, { status: 200 });
  } catch (error) {
    console.error("Error al editar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
