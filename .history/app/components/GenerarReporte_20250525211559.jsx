"use client";
import { useState } from "react";

export default function ReportePorFecha() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const descargar = () => {
    if (!desde || !hasta) {
      alert("Seleccioná ambas fechas");
      return;
    }

    const url = `/api/reporte?desde=${desde}&hasta=${hasta}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="date"
        value={desde}
        onChange={(e) => setDesde(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={hasta}
        onChange={(e) => setHasta(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={descargar}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
      >
        Descargar Excel
      </button>
    </div>
  );
}
