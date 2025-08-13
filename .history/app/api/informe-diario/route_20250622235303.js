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
    const client = await clientPromise;
    const db = client.db("comandas");

    const ingresos = await db.collection("ingresosDiarios").find().toArray();
    const retiros = await db.collection("retiroEfectivo").find().toArray();

    const agruparPorFecha = {};

    // Procesar ingresos
    for (const ingreso of ingresos) {
      const fechaISO = new Date(ingreso.fecha || ingreso.timestamp)
        .toISOString()
        .split("T")[0];
      if (!agruparPorFecha[fechaISO]) {
        agruparPorFecha[fechaISO] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }
      agruparPorFecha[fechaISO].ingresoTotal +=
        ingreso.ingresoTotal || ingreso.totalPedido || 0;
    }

    // Procesar retiros
    for (const retiro of retiros) {
      const fechaISO = new Date(retiro.fecha).toISOString().split("T")[0];
      if (!agruparPorFecha[fechaISO]) {
        agruparPorFecha[fechaISO] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          retiros: [],
        };
      }
      agruparPorFecha[fechaISO].retirosTotal += retiro.montoRetirado;
      agruparPorFecha[fechaISO].retiros.push({
        hora: new Date(retiro.fecha).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        monto: retiro.montoRetirado,
        motivo: retiro.motivo,
      });
    }

    // Formatear respuesta
    const resultado = Object.entries(agruparPorFecha).map(([fecha, datos]) => ({
      fecha,
      ingresoTotal: datos.ingresoTotal,
      retirosTotal: datos.retirosTotal,
      neto: datos.ingresoTotal - datos.retirosTotal,
      retiros: datos.retiros,
    }));

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error al generar informe diario:", err);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
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
