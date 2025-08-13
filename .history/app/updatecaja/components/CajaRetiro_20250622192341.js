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

  const fetchCaja = async () => {
    try {
      const res = await fetch("/api/caja-registradora");
      const data = await res.json();
      setDineroCaja(data.montoActual || 0);
    } catch (err) {
      console.error("Error cargando caja:", err);
    }
  };

  const fetchInforme = async () => {
    try {
      const res = await fetch("/api/informe-diario");
      const data = await res.json();

      if (!Array.isArray(data)) return setInforme([]);

      const ordenado = data.sort((a, b) => {
        const [d1, m1, y1] = a.fecha.split("/").map(Number).reverse();
        const [d2, m2, y2] = b.fecha.split("/").map(Number).reverse();
        return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
      });

      setInforme(ordenado);
    } catch (err) {
      console.error("Error cargando informe:", err);
    }
  };

  useEffect(() => {
    fetchCaja();
    fetchInforme();

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const ahoraArgentina = formatter.format(new Date());
    const [horaStr, minutoStr] = ahoraArgentina.split(":");
    const horaActual = parseInt(horaStr);
    const minutosActual = parseInt(minutoStr);

    const enHorarioHabilitado =
      (horaActual === 23 && minutosActual >= 30) ||
      (horaActual >= 0 && horaActual < 4);

    setMostrarCierre(enHorarioHabilitado);
  }, []);

  const handleRetiro = async () => {
    if (!retiro || parseFloat(retiro) <= 0 || motivo.trim().length < 3) {
      Swal.fire("Error", "Ingrese un monto y motivo válido", "error");
      return;
    }

    try {
      const res = await fetch("/api/retiro-efectivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montoRetirado: parseFloat(retiro),
          motivo: motivo.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", "Retiro realizado correctamente", "success");
        setRetiro("");
        setMotivo("");
        fetchCaja();
        fetchInforme();
      } else {
        Swal.fire("Error", data.error || "Ocurrió un error", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error en el servidor", "error");
    }
  };

  const toggleDetalles = (fecha) => {
    setMostrarDetalles((prev) => ({ ...prev, [fecha]: !prev[fecha] }));
  };

  const realizarCierreCaja = async () => {
    try {
      const res = await fetch("/api/cierre-caja", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        Swal.fire(
          "✅ Cierre Diario Realizado",
          `Ingresos: $${data.cierre.totalIngresos.toLocaleString()}\nRetiros: $${data.cierre.totalRetiros.toLocaleString()}\nNeto: $${data.cierre.neto.toLocaleString()}\nSaldo Caja: $${data.cierre.saldoEnCaja.toLocaleString()}`,
          "success"
        );
      } else {
        Swal.fire(
          "Error",
          data.error || "Ocurrió un error al cerrar caja",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error en el servidor", "error");
    }
  };

  const descargarExcel = async (tipo) => {
    try {
      const res = await fetch(`/api/informe/excel?tipo=${tipo}`);

      if (!res.ok) {
        const contentType = res.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Error desconocido al generar Excel"
          );
        } else {
          throw new Error("Error del servidor al generar el Excel");
        }
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retiros-${tipo}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] via-[#928dab] to-[#434343] text-white font-sans">
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
          Caja & Retiros
        </h2>

        <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full max-w-xl shadow-lg">
            <h3 className="text-white text-2xl font-bold text-center mb-6">
              Informe Diario
            </h3>
            {informe.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{item.fecha}</span>
                  <button
                    onClick={() => toggleDetalles(item.fecha)}
                    className="text-blue-400 hover:text-blue-200 transition"
                  >
                    {mostrarDetalles[item.fecha] ? "−" : "+"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-white/90 mt-1">
                  <span>
                    Ingresos:{" "}
                    <strong>${item.ingresoTotal.toLocaleString()}</strong>
                  </span>
                  <span>
                    Retiros:{" "}
                    <strong className="text-red-400">
                      -${item.retirosTotal.toLocaleString()}
                    </strong>
                  </span>
                  <span>
                    Neto:{" "}
                    <strong className="text-green-400">
                      ${item.neto.toLocaleString()}
                    </strong>
                  </span>
                </div>
                {mostrarDetalles[item.fecha] && (
                  <div className="mt-2 ml-2 text-sm text-white/80 space-y-1">
                    {item.retiros?.map((r, i) => (
                      <div key={i} className="border-l-2 border-blue-400 pl-2">
                        <span className="text-blue-200">{r.hora}</span> — $
                        {r.monto.toLocaleString()} — <em>{r.motivo}</em>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => descargarExcel("semana")}
                className="bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:scale-105 transition"
              >
                Descargar Semanal
              </button>
              <button
                onClick={() => descargarExcel("mes")}
                className="bg-gradient-to-tr from-purple-600 to-purple-400 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:scale-105 transition"
              >
                Descargar Mensual
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-white text-xl text-center mb-4">
              Dinero en caja
            </h3>
            <div className="bg-gray-300 rounded-full text-center py-3 text-black font-bold mb-6">
              ${dineroCaja.toLocaleString()}
            </div>

            <label className="text-white mb-2 block text-center">Motivo</label>
            <input
              type="text"
              placeholder="Ingrese el motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <label className="text-white mb-2 block text-center">Retiro</label>
            <input
              type="number"
              placeholder="Ingrese monto a retirar"
              value={retiro}
              onChange={(e) => setRetiro(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleRetiro}
              className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-300 transition-all mb-4"
            >
              Retirar Efectivo
            </button>

            {mostrarCierre && (
              <button
                onClick={realizarCierreCaja}
                className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                Cerrar Caja Diario
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
