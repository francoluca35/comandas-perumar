import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";

import cloudinary from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const form = new IncomingForm();
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { username, email, password, nombreCompleto, rol } = data.fields;
    const file = data.files.foto;

    if (!file || !username || !email || !password || !nombreCompleto || !rol) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    // Cargar a cloudinary directamente con path temporal:
    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: "usuarios",
    });

    const hashed = await hashPassword(password);
    const client = await clientPromise;
    const db = client.db("comandas");

    const existe = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existe) {
      return NextResponse.json(
        { error: "Usuario o email ya existe" },
        { status: 409 }
      );
    }

    await db.collection("users").insertOne({
      username,
      email,
      password: hashed,
      nombreCompleto,
      rol,
      imagen: uploadResult.secure_url,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al registrar:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
