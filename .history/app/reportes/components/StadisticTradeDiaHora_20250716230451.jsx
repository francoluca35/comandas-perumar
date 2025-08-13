"use client";
import React, { useEffect, useState } from "react";

function StadisticTradeDiaHora() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/estadisticas/dia-hora")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data)
    return <p className="text-center text-gray-400 mt-6">Cargando datos...</p>;

  return (
    <div className="bg-[#181818] p-6 mt-4 rounded-xl shadow-lg overflow-x-auto">
      <h2 className="text-center text-lg font-semibold text-gray-200 mb-4">
        Ingresos por día
      </h2>
      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr>
            <th className="bg-[#2a2a2a] text-left text-gray-300 px-4 py-2 rounded-l-lg">
              Fecha
            </th>
            <th className="bg-[#2a2a2a] text-right text-gray-300 px-4 py-2 rounded-r-lg">
              Cantidad
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ _id, cantidad }) => (
            <tr key={_id}>
              <td className="bg-[#222] text-gray-100 font-medium px-4 py-2 rounded-l-lg">
                {_id}
              </td>
              <td
                className="text-right font-semibold px-4 py-2 rounded-r-lg"
                style={{
                  backgroundColor: "rgba(100, 180, 250, 0.25)",
                  color: "#111",
                }}
              >
                {cantidad}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StadisticTradeDiaHora;
