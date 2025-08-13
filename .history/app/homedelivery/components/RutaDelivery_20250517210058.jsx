"use client";

import { useEffect, useState } from "react";
import { FiMapPin, FiCheck } from "react-icons/fi";

export default function RutaDelivery() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    const res = await fetch("/api/pedidos");
    const data = await res.json();

    const ahora = new Date();

    // Filtrar y eliminar entregados con más de 8 horas
    const filtrados = data.filter((p) => {
      if (p.estado === "entregado" && p.horaEntrega) {
        const entrega = new Date(p.horaEntrega);
        const diffHoras = (ahora - entrega) / (1000 * 60 * 60);
        return diffHoras <= 8;
      }
      return true;
    });

    // Ordenar por horaEntrega o fecha (más reciente primero)
    const sorted = filtrados.sort((a, b) => {
      const dateA = new Date(a.horaEntrega || a.fecha);
      const dateB = new Date(b.horaEntrega || b.fecha);
      return dateB - dateA;
    });

    setPedidos(sorted);
  };

  const marcarEntregado = async (id) => {
    const horaEntrega = new Date().toISOString();
    await fetch(`/api/pedidos/entregar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, horaEntrega }),
    });
    fetchPedidos();
  };

  const pedidosEnCamino = pedidos.filter((p) => p.estado === "en camino");
  const pedidosEntregados = pedidos.filter((p) => p.estado === "entregado");

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white p-6">
      <h2 className="text-xl mb-4 font-semibold">Bienvenido “Username”.</h2>

      <h3 className="text-center text-2xl font-bold mb-6">MIS PEDIDOS</h3>

      {/* EN CAMINO */}
      <h4 className="text-lg font-medium mb-2">En camino</h4>
      {pedidosEnCamino.map((pedido) => (
        <div
          key={pedido._id}
          className="bg-blue-900 text-white p-4 rounded-xl mb-4 shadow-md"
        >
          <p className="font-bold text-lg">Pedido ({pedido.nombre})</p>
          <p className="text-sm">Nmro De Orden: {pedido._id}</p>
          <p className="text-sm">Dirección: {pedido.direccion}</p>

          <div className="mt-3 flex gap-3">
            <a
              href={pedido.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 text-black px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-300 transition"
            >
              <FiMapPin /> Ver Mapa
            </a>
            <button
              onClick={() => marcarEntregado(pedido._id)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              <FiCheck /> Entregar
            </button>
          </div>
        </div>
      ))}

      {/* ENTREGADOS */}
      {pedidosEntregados.length > 0 && (
        <>
          <h4 className="text-lg font-medium mt-8 mb-2">Entregados</h4>
          {pedidosEntregados.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-green-700 text-white p-4 rounded-xl mb-4 shadow-md"
            >
              <p className="font-bold text-lg">Pedido ({pedido.nombre})</p>
              <p className="text-sm">Nmro De Orden: {pedido._id}</p>
              <p className="text-sm">Dirección: {pedido.direccion}</p>
              {pedido.horaEntrega && (
                <p className="text-sm">
                  Hora de entrega:{" "}
                  {new Date(pedido.horaEntrega).toLocaleString()}
                </p>
              )}

              <div className="mt-3 flex gap-3">
                <a
                  href={pedido.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 text-black px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-300 transition"
                >
                  <FiMapPin /> Ver Mapa
                </a>
                <button
                  disabled
                  className="bg-gray-300 text-black px-4 py-2 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed"
                >
                  <FiCheck /> Entregado
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
