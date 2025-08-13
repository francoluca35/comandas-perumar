"use client";
import { useEffect, useState } from "react";

export default function CajaResumen() {
  const [efectivo, setEfectivo] = useState(0);
  const [mercadoPago, setMercadoPago] = useState(0);
  const [cantidadPagos, setCantidadPagos] = useState(0);
  const [ultimoPago, setUltimoPago] = useState(null);

  const obtenerDatos = async () => {
    try {
      // Efectivo
      const resEfectivo = await fetch("/api/caja-registradora");
      const dataEfectivo = await resEfectivo.json();
      setEfectivo(dataEfectivo.montoActual || 0);

      // Mercado Pago
      const resMP = await fetch("/api/mercado-pago/ingresos");
      const dataMP = await resMP.json();
      setMercadoPago(dataMP.ingresosHoy || 0);
      setCantidadPagos(dataMP.cantidadPagos || 0);
      setUltimoPago(dataMP.ultimoPago || null);
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
      <div className="text-center">Balance de ingresos</div>
      <div className="flex justify-between mb-2 text-lg font-bold">
        <span>Efectivo:</span> <span>${efectivo.toFixed(2)}</span>
      </div>
      <hr className="border-black" />
      <div className="flex justify-between mt-2 text-lg font-bold">
        <span>Mercado Pago:</span>
        <span>
          ${mercadoPago.toFixed(2)} ({cantidadPagos} pagos)
        </span>
      </div>
      {ultimoPago && (
        <div className="mt-2 text-sm text-gray-700">
          Último: {ultimoPago.cliente} -{" "}
          {new Date(ultimoPago.fecha).toLocaleTimeString("es-AR")}
        </div>
      )}
    </div>
  );
}
