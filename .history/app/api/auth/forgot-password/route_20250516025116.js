import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sign } from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo es obligatorio" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("comandas");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró un usuario con ese correo" },
        { status: 404 }
      );
    }

    const token = sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "30m",
    });

    const resetLink = `${BASE_URL}/reset-password?token=${token}`;

    // Enviar mail
    const transporter = nodemailer.createTransport({
      service: "gmail", // O tu proveedor
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Soporte <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Recupera tu contraseña",
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz click aquí para cambiarla:</p>
        <a href="${resetLink}" target="_blank">Restablecer contraseña</a>
        <br/><br/>
        <p>Este enlace expirará en 30 minutos.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
