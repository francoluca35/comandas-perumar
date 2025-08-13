"use client";

import { useEffect, useState } from "react";

export default function CajaResumen() {
  const [efectivo, setEfectivo] = useState(0);
  const [mercadoPago, setMercadoPago] = useState(0);

  const obtenerDatos = async () => {
    try {
      // Leer Efectivo desde tu API
      const resEfectivo = await fetch("/api/caja-registradora");
      const dataEfectivo = await resEfectivo.json();
      setEfectivo(dataEfectivo.montoActual || 0); // <-- ACA estaba el problema

      // Leer Mercado Pago (queda igual)
    } catch (error) {
      console.error("Error al cargar datos de caja", error);
    }
  };

  useEffect(() => {
    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 10000); // Actualiza cada 10s
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="bg-gray-300 text-black rounded-xl w-72 p-4 mb-6 shadow-lg">
      <div className="text-center"> balance de ingresos</div>
      <div className="flex justify-between mb-2 text-lg font-bold">
        <span>Efectivo:</span> <span>${efectivo.toFixed(2)}</span>
      </div>
      <hr className="border-black" />
      <div className="flex justify-between mt-2 text-lg font-bold">
        <span>Mercado Pago:</span> <span>$</span>
      </div>
    </div>
  );
}
