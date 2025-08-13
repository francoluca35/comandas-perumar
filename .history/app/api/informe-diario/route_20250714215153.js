import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 4;

    const db = await connectToDatabase();

    const ingresos = await db.collection("ingresosDiarios").find({}).toArray();
    const retiros = await db.collection("retiroEfectivo").find({}).toArray();
    const cierres = await db.collection("cierresCaja").find({}).toArray();

    const map = {};

    ingresos.forEach((ing) => {
      const fecha = ing.fecha;
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
      map[fecha].ingresoTotal += ing.ingresoTotal || 0;
    });

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

    // aplicar paginación
    const total = ordenado.length;
    const start = (page - 1) * limit;
    const end = page * limit;
    const paginado = ordenado.slice(start, end);

    return NextResponse.json({ data: paginado, total });
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

    const fecha = new Date(timestamp).toISOString().split("T")[0];

    await db.collection("ingresosDiarios").insertOne({
      ingresoTotal: parseFloat(totalPedido),
      timestamp: new Date(timestamp),
      fecha: fecha,
    });

    return NextResponse.json({ message: "Ingreso diario registrado" });
  } catch (err) {
    console.error("Error al guardar ingreso diario:", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
