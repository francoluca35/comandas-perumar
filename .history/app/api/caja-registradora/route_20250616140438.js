import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET para consultar el monto actual
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const caja = await db.collection("cajaRegistradora").findOne({});
    if (!caja) {
      return NextResponse.json({ montoActual: 0 });
    }

    return NextResponse.json({
      montoActual: caja.montoActual,
      fechaActualizacion: caja.fechaActualizacion,
    });
  } catch (err) {
    console.error("Error al obtener caja:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST para actualizar el monto manualmente
export async function POST(req) {
  try {
    const { monto } = await req.json();

    if (monto == null) {
      return NextResponse.json({ error: "Falta el monto" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const update = {
      montoActual: parseFloat(monto),
      fechaActualizacion: new Date(),
    };

    await db
      .collection("cajaRegistradora")
      .updateOne({}, { $set: update }, { upsert: true });

    return NextResponse.json({ message: "Monto actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar caja:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const { monto } = await req.json();

    if (monto == null) {
      return NextResponse.json({ error: "Falta el monto" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("cajaRegistradora").updateOne(
      {},
      {
        $inc: { montoActual: parseFloat(monto) },
        $set: { fechaActualizacion: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Monto sumado correctamente" });
  } catch (err) {
    console.error("Error al sumar monto:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
