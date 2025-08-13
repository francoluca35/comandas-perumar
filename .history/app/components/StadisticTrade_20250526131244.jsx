"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function StadisticTrade() {
  const [datos, setDatos] = useState(null);
  const lineChartRef = useRef();
  const barChartRef = useRef();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/estadisticas");
      const json = await res.json();
      setDatos(json);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (datos) {
      renderLineChart(datos.horarios);
      renderBarChart(datos.topComidas);
    }
  }, [datos]);

  const renderLineChart = (data) => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const formateado = data.map((d) => ({
      dia: dias[d._id.dia - 1],
      hora: d._id.hora,
      cantidad: d.cantidad,
    }));

    d3.select(lineChartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const width = lineChartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(lineChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 23]).range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(formateado, (d) => d.cantidad)])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(dias);

    const line = d3
      .line()
      .x((d) => x(d.hora))
      .y((d) => y(d.cantidad))
      .curve(d3.curveMonotoneX);

    const grouped = d3.groups(formateado, (d) => d.dia);

    grouped.forEach(([dia, valores]) => {
      svg
        .append("path")
        .datum(valores)
        .attr("fill", "none")
        .attr("stroke", color(dia))
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(24)
          .tickFormat((d) => `${d}:00`)
      )
      .selectAll("text")
      .style("font-size", "12px");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");
  };

  const renderBarChart = (data) => {
    d3.select(barChartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 70, left: 40 };
    const width = barChartRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select(barChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d._id))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.cantidad)])
      .nice()
      .range([height, 0]);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d._id))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.cantidad))
      .attr("height", (d) => height - y(d.cantidad))
      .attr("fill", "#4f46e5")
      .attr("rx", 4);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");
  };

  return (
    <div className="space-y-8 px-4 md:px-8">
      <div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">
          Clientes por día y hora
        </h2>
        <div
          ref={lineChartRef}
          className="w-full overflow-x-auto"
          style={{ minHeight: 320 }}
        ></div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">
          Top comidas (Lun a Vie)
        </h2>
        <div
          ref={barChartRef}
          className="w-full overflow-x-auto"
          style={{ minHeight: 320 }}
        ></div>
      </div>
    </div>
  );
}

export default StadisticTrade;
