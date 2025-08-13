"use client";
import { useState } from "react";

export default function ReportePorFecha() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(false);

  const descargar = async () => {
    if (!desde || !hasta) {
      alert("Seleccioná ambas fechas");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/reporte?desde=${desde}&hasta=${hasta}`;
      const res = await fetch(url);

      if (!res.ok) {
        alert("Error al descargar el reporte");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "clientes_rango.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      alert("Error al descargar el archivo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-8 rounded-2xl shadow-lg max-w-xl mx-auto">
      <input
        type="date"
        value={desde}
        onChange={(e) => setDesde(e.target.value)}
        className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 transition-shadow shadow-sm hover:shadow-md"
      />
      <input
        type="date"
        value={hasta}
        onChange={(e) => setHasta(e.target.value)}
        className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-600 transition-shadow shadow-sm hover:shadow-md"
      />
      <button
        disabled={loading}
        onClick={descargar}
        className={`relative flex items-center justify-center px-6 py-3 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto`}
      >
        {loading && (
          <span className="absolute left-4 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-white"></span>
          </span>
        )}
        {loading ? "Descargando..." : "Descargar Excel"}
      </button>
    </div>
  );
}
