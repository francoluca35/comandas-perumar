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

      if (!Array.isArray(data)) {
        setInforme([]);
        return;
      }

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
    setMostrarDetalles((prev) => ({
      ...prev,
      [fecha]: !prev[fecha],
    }));
  };

  const realizarCierreCaja = async () => {
    try {
      const res = await fetch("/api/cierre-caja", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        Swal.fire(
          "✅ Cierre Diario Realizado",
          `Ingresos: $${data.cierre.totalIngresos.toLocaleString()}
           \nRetiros: $${data.cierre.totalRetiros.toLocaleString()}
           \nNeto: $${data.cierre.neto.toLocaleString()}
           \nSaldo Caja: $${data.cierre.saldoEnCaja.toLocaleString()}`,
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
        const error = await res.json(); // <-- esto te da más info
        throw new Error(error.error || "Error desconocido");
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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950">
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

        <div className="bg-black/50 p-6 rounded-xl flex flex-col md:flex-row gap-10 mb-10">
          {/* Informe */}
          <div className="bg-white/10 p-4 rounded-lg border border-blue-400 w-[400px]">
            <h3 className="text-white text-xl text-center mb-4">
              Informe Diario
            </h3>
            {informe.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-center text-white font-semibold">
                  <span>{item.fecha}</span>
                  <button
                    className="text-blue-400 hover:text-blue-200"
                    onClick={() => toggleDetalles(item.fecha)}
                  >
                    {mostrarDetalles[item.fecha] ? "−" : "+"}
                  </button>
                </div>
                <div className="flex justify-between text-sm text-white">
                  <span>Ingresos: ${item.ingresoTotal.toLocaleString()}</span>
                  <span>Retiros: -${item.retirosTotal.toLocaleString()}</span>
                  <span>Neto: ${item.neto.toLocaleString()}</span>
                </div>
                {mostrarDetalles[item.fecha] && (
                  <div className="mt-2 ml-2 text-sm text-white/90">
                    {item.retiros?.map((r, i) => (
                      <div key={i}>
                        {r.hora} - ${r.monto.toLocaleString()} - {r.motivo}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Panel de retiro */}
          <div className="bg-white/10 p-6 rounded-lg w-[300px]">
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

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => descargarExcel("semana")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Descargar Excel Semanal
              </button>
              <button
                onClick={() => descargarExcel("mes")}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Descargar Excel Mensual
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
