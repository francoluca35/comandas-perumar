// components/ExportExcel.js
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ExportExcel() {
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  const generarExcel = async () => {
    if (!fechaDesde || !fechaHasta) {
      alert("Selecciona ambas fechas");
      return;
    }

    const response = await fetch("/api/exportar-excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desde: fechaDesde, hasta: fechaHasta }),
    });

    if (!response.ok) {
      alert("Error al generar el Excel");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <div>
        <label>Desde: </label>
        <DatePicker
          selected={fechaDesde}
          onChange={(date) => setFechaDesde(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <div>
        <label>Hasta: </label>
        <DatePicker
          selected={fechaHasta}
          onChange={(date) => setFechaHasta(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <button onClick={generarExcel}>Generar Excel</button>
    </div>
  );
}
