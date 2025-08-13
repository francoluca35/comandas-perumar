import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

function normalizarFecha(fecha) {
  try {
    return new Date(fecha).toISOString().split("T")[0]; // "2025-06-22"
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase();

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const agrupado = {};

    // Agrupar ingresos
    for (const ingreso of ingresos) {
      const fecha = normalizarFecha(ingreso.fecha);
      if (!fecha) continue;

      if (!agrupado[fecha]) {
        agrupado[fecha] = {
          fecha,
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }

      agrupado[fecha].ingresoTotal += ingreso.ingresoTotal || 0;
    }

    // Agrupar retiros
    for (const retiro of retiros) {
      const fecha = normalizarFecha(retiro.timestamp);
      if (!fecha) continue;

      if (!agrupado[fecha]) {
        agrupado[fecha] = {
          fecha,
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }

      agrupado[fecha].retirosTotal += retiro.montoRetirado || 0;
      agrupado[fecha].retiros.push({
        hora: new Date(retiro.timestamp).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        monto: retiro.montoRetirado || 0,
        motivo: retiro.motivo || "",
      });
    }

    const resultado = Object.values(agrupado)
      .map((dia) => ({
        ...dia,
        neto: dia.ingresoTotal - dia.retirosTotal,
      }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // orden descendente

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error en informe diario:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    await db.collection("ingresosDiarios").insertOne({
      totalPedido: parseFloat(totalPedido),
      timestamp: new Date(timestamp),
    });

    return NextResponse.json({ message: "Ingreso diario registrado" });
  } catch (err) {
    console.error("Error al guardar ingreso diario:", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
