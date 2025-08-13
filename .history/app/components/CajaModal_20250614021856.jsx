"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";
import Swal from "sweetalert2";

export default function CajaRetiro() {
  const [dineroCaja, setDineroCaja] = useState(0);
  const [retiro, setRetiro] = useState("");
  const [informe, setInforme] = useState([]);

  // Traer monto actual de caja
  const fetchCaja = async () => {
    try {
      const res = await fetch("/api/caja-registradora");
      const data = await res.json();
      setDineroCaja(data.montoActual || 0);
    } catch (err) {
      console.error("Error cargando caja:", err);
    }
  };

  // Traer informe diario (con ingresos de cobros efectivos)
  const fetchInforme = async () => {
    try {
      const res = await fetch("/api/informe-diario");
      const data = await res.json();

      if (!Array.isArray(data)) {
        setInforme([]);
        return;
      }

      const ordenado = data.sort((a, b) => {
        const [d1, m1, y1] = a.fecha.split("/").map(Number).reverse();
        const [d2, m2, y2] = b.fecha.split("/").map(Number).reverse();
        return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
      });

      setInforme(ordenado);
    } catch (err) {
      console.error("Error cargando informe:", err);
    }
  };

  useEffect(() => {
    fetchCaja();
    fetchInforme();
  }, []);

  const handleRetiro = async () => {
    if (!retiro || parseFloat(retiro) <= 0) {
      Swal.fire("Error", "Ingrese un monto válido", "error");
      return;
    }

    try {
      const res = await fetch("/api/retiro-efectivo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montoRetirado: parseFloat(reti
