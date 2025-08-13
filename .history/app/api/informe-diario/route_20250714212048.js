import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const ingresos = await db.collection("ingresosDiarios").find({}).toArray();
    const retiros = await db.collection("retiroEfectivo").find({}).toArray();
    const cierres = await db.collection("cierresCaja").find({}).toArray();

    const map = {};

    ingresos.forEach((ing) => {
      const fecha = ing.fecha;
      if (!fecha) return;
      if (!map[fecha])
        map[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
          cierre: null,
        };
      map[fecha].ingresoTotal += ing.ingresoTotal || 0;
    });

    retiros.forEach((ret) => {
      const fecha =
        ret.fecha || new Date(ret.timestamp).toISOString().split("T")[0];
      if (!fecha) return;
      if (!map[fecha])
        map[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
          cierre: null,
        };
      map[fecha].retirosTotal += ret.montoRetirado || 0;
      map[fecha].retiros.push({
        hora: new Date(ret.timestamp).toLocaleTimeString("es-AR"),
        monto: ret.montoRetirado,
        motivo: ret.motivo,
      });
    });

    cierres.forEach((cierre) => {
      const fecha = cierre.fechaCierre;
      if (!fecha) return;
      if (!map[fecha])
        map[fecha] = {
          ingresoTotal: 0,
          retirosTotal: 0,
          neto: 0,
          retiros: [],
          cierre: null,
        };
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
    }));

    // PAGINACIÓN
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "4", 10);

    const total = resultado.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = resultado
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      datos: paginated,
      page,
      totalPages,
    });
  } catch (err) {
    console.error("Error al generar informe diario:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
