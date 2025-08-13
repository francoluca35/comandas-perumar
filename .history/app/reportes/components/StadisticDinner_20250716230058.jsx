"use client";
import React, { useEffect, useState } from "react";

function StadisticDinner() {
  const [data, setData] = useState(null);
  const ahora = new Date();
  const esDiciembre = ahora.getMonth() === 7; // Diciembre = 11 (0-indexed)

  useEffect(() => {
    fetch("/api/estadisticas/dinner")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const formatCurrency = (n) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  if (!data)
    return (
      <p className="text-center text-gray-400 mt-6">Cargando estadísticas...</p>
    );

  const totalDia = data.porDia?.[0]?.total || 0;
  const totalSemana = data.porSemana?.[0]?.total || 0;
  const totalMes = data.porMes?.[0]?.total || 0;

  const handleDescargaAnual = () => {
    const link = document.createElement("a");
    link.href = "/api/estadisticas/descargar-total-anual";
    link.download = `Totales_${ahora.getFullYear()}.xlsx`;
    link.click();
  };

  return (
    <div className="bg-[#181818] p-6 rounded-xl shadow-lg w-full space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h3 className="text-sm text-blue-800 font-medium">Hoy</h3>
          <p className="text-xl font-bold text-blue-900">
            {formatCurrency(totalDia)}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <h3 className="text-sm text-green-800 font-medium">Esta Semana</h3>
          <p className="text-xl font-bold text-green-900">
            {formatCurrency(totalSemana)}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <h3 className="text-sm text-yellow-800 font-medium">Este Mes</h3>
          <p className="text-xl font-bold text-yellow-900">
            {formatCurrency(totalMes)}
          </p>
        </div>
      </div>

      {esDiciembre && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleDescargaAnual}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            📤 Descargar Excel Anual y Borrar Datos
          </button>
        </div>
      )}
    </div>
  );
}

export default StadisticDinner;
