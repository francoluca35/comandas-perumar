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
    <div className="flex items-center gap-6 max-w-lg mx-auto p-6 bg-white rounded-3xl shadow-lg">
      <input
        type="date"
        value={desde}
        onChange={(e) => setDesde(e.target.value)}
        className="flex-1 px-5 py-3 rounded-xl border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500 transition"
      />
      <input
        type="date"
        value={hasta}
        onChange={(e) => setHasta(e.target.value)}
        className="flex-1 px-5 py-3 rounded-xl border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500 transition"
      />
      <button
        disabled={loading}
        onClick={descargar}
        className="relative flex items-center justify-center px-6 py-3 rounded-3xl
          bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500
          text-white font-semibold shadow-lg
          hover:brightness-110 active:brightness-90
          transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <svg
            className="animate-spin mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {loading ? "Descargando..." : "Descargar Excel"}
      </button>
    </div>
  );
}
