import { NextResponse } from "next/server";
import busboy from "busboy";
import cloudinary from "@/lib/cloudinary";
import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/utils/encrypt";
import { Readable } from "stream";

export const config = {
  api: { bodyParser: false },
};

async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: Object.fromEntries(req.headers) });

    const fields = {};
    let fileBuffer = null;
    let fileMime = null;

    bb.on("file", (name, file, info) => {
      const buffers = [];
      fileMime = info.mimeType;
      file.on("data", (data) => buffers.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(buffers);
      });
    });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("finish", () => {
      resolve({ fields, fileBuffer, fileMime });
    });

    bb.on("error", reject);

    const stream = Readable.fromWeb(req.body);
    stream.pipe(bb);
  });
}

export async function POST(req) {
  try {
    const { fields, fileBuffer, fileMime } = await parseFormData(req);

    const { username, email, password, nombreCompleto, rol } = fields;

    if (
      !fileBuffer ||
      !username ||
      !email ||
      !password ||
      !nombreCompleto ||
      !rol
    ) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const base64File = `data:${fileMime};base64,${fileBuffer.toString(
      "base64"
    )}`;

    const uploadResult = await cloudinary.uploader.upload(base64File, {
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
