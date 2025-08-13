"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";

export default function HistorialRetiros() {
  const [retiros, setRetiros] = useState([]);

  const fetchRetiros = async () => {
    try {
      const res = await fetch("/api/retiro-efectivo");
      const data = await res.json();

      if (!Array.isArray(data)) {
        setRetiros([]);
        return;
      }

      const ordenado = data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setRetiros(ordenado);
    } catch (err) {
      console.error("Error al cargar retiros:", err);
    }
  };

  useEffect(() => {
    fetchRetiros();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackArrow />
          <div className="flex items-center gap-3">
            <Image
              src="/Assets/Mesas/logo-peru-mar.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full border border-white shadow-sm"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">
              PeruMar<span className="text-blue-400">.</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center mt-10 px-4">
        <h2 className="text-white text-3xl font-semibold mb-10">
          Historial de Retiros
        </h2>

        <div className="bg-black/50 p-6 rounded-xl w-full max-w-4xl">
          <table className="w-full text-center text-white text-sm">
            <thead>
              <tr className="border-b border-white">
                <th>Fecha</th>
                <th>Hora</th>
                <th>Antiguo Monto</th>
                <th>Retiro</th>
                <th>Monto Actual</th>
              </tr>
            </thead>
            <tbody>
              {retiros.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-gray-400">
                    No hay retiros registrados.
                  </td>
                </tr>
              )}
              {retiros.map((r, index) => (
                <tr key={index} className="border-b border-white">
                  <td>{r.fecha}</td>
                  <td>{r.hora}</td>
                  <td>${r.antiguoMonto.toLocaleString()}</td>
                  <td className="text-red-400">
                    -${r.montoRetirado.toLocaleString()}
                  </td>
                  <td>${r.montoActualizado.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
