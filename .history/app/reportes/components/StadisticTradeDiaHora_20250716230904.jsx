"use client";
import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays } from "date-fns";

function StadisticTradeDiaHora() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/estadisticas/dia-hora")
      .then((res) => res.json())
      .then((raw) => {
        const transformado = raw.map((d) => ({
          date: d._id,
          count: d.cantidad,
        }));
        setData(transformado);
      });
  }, []);

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <div className="bg-[#181818] p-6 mt-4 rounded-xl shadow-lg overflow-x-auto text-white">
      <h2 className="text-center text-lg font-semibold mb-4">
        Ingresos diarios (Calendario)
      </h2>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={data}
        classForValue={(value) => {
          if (!value || value.count === 0) return "color-empty";
          if (value.count < 5) return "color-scale-1";
          if (value.count < 10) return "color-scale-2";
          if (value.count < 20) return "color-scale-3";
          return "color-scale-4";
        }}
        tooltipDataAttrs={(value) =>
          value.date
            ? { "data-tip": `${value.date}: ${value.count} ingresos` }
            : { "data-tip": "Sin datos" }
        }
        showWeekdayLabels={true}
      />
    </div>
  );
}

export default StadisticTradeDiaHora;
