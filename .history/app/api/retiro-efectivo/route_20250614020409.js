import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req) {
  const { db } = await connectToDatabase();
  const { montoRetirado } = await req.json();

  if (!montoRetirado || montoRetirado <= 0) {
    return Response.json({ error: "Monto inválido" }, { status: 400 });
  }

  const caja = await db.collection("cajaRegistradora").findOne({});
  if (!caja) {
    return Response.json({ error: "Caja no inicializada" }, { status: 400 });
  }

  const antiguoMonto = caja.montoActual;
  const montoActualizado = antiguoMonto - montoRetirado;

  await db.collection("retiroEfectivo").insertOne({
    fecha: new Date().toLocaleDateString("es-AR"),
    hora: new Date().toLocaleTimeString("es-AR"),
    antiguoMonto,
    montoRetirado,
    montoActualizado,
    timestamp: new Date(),
  });

  await db
    .collection("cajaRegistradora")
    .updateOne({ _id: caja._id }, { $set: { montoActual: montoActualizado } });

  return Response.json({ success: true }, { status: 200 });
}
