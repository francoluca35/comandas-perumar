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
    const formateado = data.map(d => ({
      dia: dias[d._id.dia - 1],
      hora: d._id.hora,
      cantidad: d.cantidad
    }));

    d3.select(lineChartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(lineChartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, 23])
      .range([0, width]);
