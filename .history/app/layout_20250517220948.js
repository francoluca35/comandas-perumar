// app/layout.js o layout.tsx
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

export const metadata = {
  title: "Comandas",
  description: "Sistema de pedidos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Google Maps Script */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_KEY}`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
