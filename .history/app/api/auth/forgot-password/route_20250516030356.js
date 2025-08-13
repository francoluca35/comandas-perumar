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
    console.log("🔗 Enlace generado:", resetLink);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Soporte <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Recupera tu contraseña",
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p><a href="${resetLink}" target="_blank">Haz clic aquí para cambiarla</a></p>
        <p>Este enlace expirará en 30 minutos.</p>
      `,
    });

    console.log("📧 Email enviado correctamente a:", email);

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un correo con instrucciones.",
    });
  } catch (error) {
    console.error("❌ Error interno en forgot-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
