"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

function StadisticTrade() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/estadisticas");
      const json = await res.json();
      setDatos(json);
    }
    fetchData();
  }, []);

  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const diaNombre = dias[(d._id.dia + 5) % 7]; // ajusta Mongo (1–7) al orden Lun–Dom

  const lineData = datos?.horarios?.map((d) => ({
    dia: dias[d._id.dia - 1],
    hora: d._id.hora,
    cantidad: d.cantidad,
    key: `${dias[d._id.dia - 1]}-${d._id.hora}`,
  }));

  const barData = datos?.topComidas?.map((d) => ({
    comida: d._id,
    cantidad: d.cantidad,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">Clientes por día y hora</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dias.map((dia) => (
              <Line
                key={dia}
                type="monotone"
                dataKey="cantidad"
                data={lineData?.filter((d) => d.dia === dia)}
                name={dia}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Top comidas (Lun a Vie)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barData}
            margin={{ top: 20, right: 20, bottom: 50, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="comida" angle={-30} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StadisticTrade;
