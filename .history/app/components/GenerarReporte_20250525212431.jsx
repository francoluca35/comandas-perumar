"use client";
import { useState } from "react";

export default function ReportePorFecha() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const descargar = async () => {
    if (!desde || !hasta) {
      alert("Seleccioná ambas fechas");
      return;
    }

    try {
      const url = `/api/reporte?desde=${desde}&hasta=${hasta}`;
      const res = await fetch(url);

      if (!res.ok) {
        alert("Error al descargar el reporte");
        return;
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "clientes_rango.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Opcional: liberar el objeto URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      alert("Error al descargar el archivo");
      console.error(error);
    }
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
