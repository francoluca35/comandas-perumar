"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";
import Swal from "sweetalert2";

export default function CajaRetiro() {
  const [dineroCaja, setDineroCaja] = useState(0);
  const [retiro, setRetiro] = useState("");
  const [motivo, setMotivo] = useState("");
  const [informe, setInforme] = useState([]);
  const [mostrarDetalles, setMostrarDetalles] = useState({});
  const [mostrarCierre, setMostrarCierre] = useState(false);

  useEffect(() => {
    fetchCaja();
    fetchInforme();
    checkHorario();
  }, []);

  const fetchCaja = async () => {
    const res = await fetch("/api/caja-registradora");
    const data = await res.json();
    setDineroCaja(data.montoActual || 0);
  };

  const fetchInforme = async () => {
    const res = await fetch("/api/informe-diario");
    const data = await res.json();
    const ordenado = Array.isArray(data)
      ? data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      : [];
    setInforme(ordenado);
  };

  const checkHorario = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const ahora = formatter.format(new Date());
    const [h, m] = ahora.split(":".map(Number));
    const habilitado = (h === 23 && m >= 30) || (h >= 0 && h < 4);
    setMostrarCierre(habilitado);
  };

  const handleRetiro = async () => {
    if (!retiro || parseFloat(retiro) <= 0 || motivo.trim().length < 3) {
      return Swal.fire("Error", "Ingrese monto y motivo válido", "error");
    }
    const res = await fetch("/api/retiro-efectivo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montoRetirado: parseFloat(retiro), motivo }),
    });
    const data = await res.json();
    if (res.ok) {
      Swal.fire("Éxito", "Retiro registrado", "success");
      setRetiro("");
      setMotivo("");
      fetchCaja();
      fetchInforme();
    } else {
      Swal.fire("Error", data.error || "Ocurrió un error", "error");
    }
  };

  const descargarExcel = async (tipo) => {
    try {
      const res = await fetch(`/api/informe/excel?tipo=${tipo}`);
      if (!res.ok) throw new Error("Error al generar Excel");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retiros-${tipo}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <header className="w-full max-w-5xl flex items-center gap-4 mb-8">
        <BackArrow />
        <Image
          src="/Assets/Mesas/logo-peru-mar.png"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className="text-3xl font-bold">
          PeruMar<span className="text-blue-500">.</span>
        </h1>
      </header>

      <h2 className="text-4xl font-semibold mb-6">Caja & Retiros</h2>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        <div className="flex-1 bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h3 className="text-xl mb-4 font-bold">Informe Diario</h3>
          {informe.map((item, i) => (
            <div key={i} className="mb-4 border-b border-white/20 pb-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{item.fecha}</span>
                <button
                  onClick={() =>
                    setMostrarDetalles((prev) => ({
                      ...prev,
                      [item.fecha]: !prev[item.fecha],
                    }))
                  }
                >
                  {mostrarDetalles[item.fecha] ? "−" : "+"}
                </button>
              </div>
              <div className="text-sm">
                <p>
                  Ingresos:{" "}
                  <span className="text-green-400">
                    ${item.ingresoTotal.toLocaleString()}
                  </span>
                </p>
                <p>
                  Retiros:{" "}
                  <span className="text-red-400">
                    -${item.retirosTotal.toLocaleString()}
                  </span>
                </p>
                <p>
                  Neto:{" "}
                  <span
                    className={
                      item.neto < 0 ? "text-red-400" : "text-green-400"
                    }
                  >
                    ${item.neto.toLocaleString()}
                  </span>
                </p>
              </div>
              {mostrarDetalles[item.fecha] && item.retiros?.length > 0 && (
                <ul className="mt-2 text-xs text-gray-300 list-disc list-inside">
                  {item.retiros.map((r, j) => (
                    <li key={j}>
                      {r.hora} - ${r.monto.toLocaleString()} - {r.motivo}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => descargarExcel("semana")}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Descargar Semanal
            </button>
            <button
              onClick={() => descargarExcel("mes")}
              className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600"
            >
              Descargar Mensual
            </button>
          </div>
        </div>

        <div className="flex-1 bg-zinc-900 p-6 rounded-2xl shadow-md">
          <h3 className="text-xl text-center font-bold mb-4">Dinero en caja</h3>
          <div className="bg-white text-black rounded-full text-center py-3 text-lg font-bold mb-6">
            ${dineroCaja.toLocaleString()}
          </div>
          <label className="block mb-2">Motivo</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ingrese el motivo"
            className="w-full px-4 py-2 mb-4 rounded bg-zinc-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="block mb-2">Retiro</label>
          <input
            type="number"
            value={retiro}
            onChange={(e) => setRetiro(e.target.value)}
            placeholder="Ingrese monto a retirar"
            className="w-full px-4 py-2 mb-4 rounded bg-zinc-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleRetiro}
            className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-300"
          >
            Retirar Efectivo
          </button>

          {mostrarCierre && (
            <button
              onClick={() => realizarCierreCaja()}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Cerrar Caja Diario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
