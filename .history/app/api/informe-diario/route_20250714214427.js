import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const ingresos = await db.collection("ingresosDiarios").find({}).toArray();
    const retiros = await db.collection("retiroEfectivo").find({}).toArray();
    const cierres = await db.collection("cierresCaja").find({}).toArray();

    const map: Record<string, any> = {};

    // Agrupar ingresos
    ingresos.forEach((ing) => {
      const fecha = ing.fecha;
      if (!fecha) return; // saltar si no hay fecha
      if (!map[fecha]) {
        map[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
          cierre: null,
        };
      }
      map[fecha].ingresoTotal += ing.ingresoTotal || 0;
    });

    // Agrupar retiros
    retiros.forEach((ret) => {
      const fecha =
        ret.fecha || new Date(ret.timestamp).toISOString().split("T")[0];
      if (!fecha) return;
      if (!map[fecha]) {
        map[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
          cierre: null,
        };
      }
      map[fecha].retirosTotal += ret.montoRetirado || 0;
      map[fecha].retiros.push({
        hora: new Date(ret.timestamp).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        monto: ret.montoRetirado,
        motivo: ret.motivo,
      });
    });

    // Agregar cierre de caja
    cierres.forEach((cierre) => {
      const fecha = cierre.fechaCierre;
      if (!fecha) return;
      if (!map[fecha]) {
        map[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
          cierre: null,
        };
      }
      map[fecha].cierre = {
        totalIngresos: cierre.totalIngresos,
        totalRetiros: cierre.totalRetiros,
        neto: cierre.neto,
        saldoEnCaja: cierre.saldoEnCaja,
        hora: cierre.horaCierre,
      };
    });

    const resultado = Object.entries(map).map(([fecha, datos]) => ({
      fecha,
      ...datos,
      neto: datos.cierre?.neto ?? datos.ingresoTotal - datos.retirosTotal,
      cierreCaja: datos.cierre?.saldoEnCaja ?? null,
    }));

    const ordenado = resultado.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return NextResponse.json(ordenado);
  } catch (err) {
    console.error("Error al generar informe diario:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { totalPedido, timestamp } = await req.json();

    if (!totalPedido || !timestamp) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const db = await connectToDatabase();

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
