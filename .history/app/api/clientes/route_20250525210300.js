// /api/clientes/route.js
import { connectDB } from "@/lib/mongodb";
import Cliente from "@/app/models/Cliente";

export async function POST(req) {
  const data = await req.json();
  await connectDB();
  await Cliente.create(data);
  return new Response("Cliente guardado", { status: 200 });
}
