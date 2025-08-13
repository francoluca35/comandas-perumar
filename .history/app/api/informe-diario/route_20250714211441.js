import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");

    const ingresos = await db.collection("ingresosDiarios").find({}).toArray();
    const retiros = await db.collection("retiroEfectivo").find({}).toArray();
    const cierres = await db.collection("cierresCaja").find({}).toArray();

    const map = {};

    ingresos.forEach((ing) => {
      const fecha = ing.fecha;
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
        ret.fecha || new Date(ret.timestamp).toLocaleDateString("es-AR");
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

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Error al generar informe diario:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
