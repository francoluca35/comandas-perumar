import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { IncomingForm } from "formidable";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Convierte el cuerpo Request de Next.js en un stream legible para formidable
async function streamRequestBody(request) {
  const reader = request.body.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) return this.push(null);
      this.push(value);
    },
  });
}

export async function POST(req) {
  try {
    const stream = await streamRequestBody(req);

    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ keepExtensions: true });
      form.parse(stream, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = data;

    const id = fields.id?.[0];
    const nombre = fields.nombre?.[0];
    const tipo = fields.tipo?.[0];
    const precio = parseFloat(fields.precio?.[0]);
    const precioConIVA = parseFloat(fields.precioConIVA?.[0]);
    const descuento = fields.descuento?.[0]
      ? parseFloat(fields.descuento?.[0])
      : undefined;
    const adicionales = fields.adicionales?.[0]
      ? JSON.parse(fields.adicionales[0])
      : [];

    if (!id || !nombre || isNaN(precio) || isNaN(precioConIVA) || !tipo) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");

    const update = {
      nombre,
      tipo,
      precio,
      precioConIVA,
      ...(descuento !== undefined && { descuento }),
      ...(tipo === "comida" && { adicionales }),
    };

    if (files.imagen && files.imagen.length > 0) {
      const file = files.imagen[0];
      const extension = path.extname(file.originalFilename);
      const newName = `${Date.now()}${extension}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", newName);
      await writeFile(uploadPath, fs.readFileSync(file.filepath));
      update.imagen = `/uploads/${newName}`;
    }

    await db
      .collection("menus")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ message: "Menú actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar menú:", error);
    return NextResponse.json(
      { message: "Error del servidor" },
      { status: 500 }
    );
  }
}
