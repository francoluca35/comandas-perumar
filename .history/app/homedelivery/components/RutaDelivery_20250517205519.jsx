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

    // Ordenar por fecha descendente
    const sorted = data
      .filter((p) => p.estado === "en camino" || p.estado === "entregado")
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    setPedidos(sorted);
  };

  const marcarEntregado = async (id) => {
    await fetch(`/api/pedidos/entregar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPedidos(); // Refrescar
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
          className="bg-blue-900 text-white p-4 rounded-md mb-4 shadow-lg"
        >
          <p className="font-bold">Pedido ({pedido.nombre})</p>
          <p>Nmro De Orden: {pedido._id}</p>
          <p>Dirección: {pedido.direccion}</p>

          <div className="mt-3 flex gap-3">
            <a
              href={pedido.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 text-black px-4 py-1 rounded hover:bg-gray-300"
            >
              Ver Mapa
            </a>
            <button
              onClick={() => marcarEntregado(pedido._id)}
              className="bg-gray-200 text-black px-4 py-1 rounded hover:bg-green-500"
            >
              Entregar
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
              className="bg-green-700 text-white p-4 rounded-md mb-4 shadow-lg"
            >
              <p className="font-bold">Pedido ({pedido.nombre})</p>
              <p>Nmro De Orden: {pedido._id}</p>
              <p>Dirección: {pedido.direccion}</p>

              <div className="mt-3 flex gap-3">
                <a
                  href={pedido.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 text-black px-4 py-1 rounded hover:bg-gray-300"
                >
                  Ver Mapa
                </a>
                <button
                  disabled
                  className="bg-gray-200 text-black px-4 py-1 rounded cursor-not-allowed"
                >
                  Entregado
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
