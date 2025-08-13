// /app/api/mesas/route.js
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("comandas");
    const mesas = await db.collection("tables").find({}).toArray();

    return NextResponse.json(mesas);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las mesas" },
      { status: 500 }
    );
  }
}
