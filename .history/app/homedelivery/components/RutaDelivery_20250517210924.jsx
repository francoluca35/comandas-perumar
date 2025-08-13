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

  const Boton = ({ children, onClick, disabled, color = "blue" }) => {
    const base =
      "px-4 py-2 rounded-xl font-semibold transition duration-300 ease-in-out shadow-md flex items-center justify-center gap-2";
    const colors = {
      blue: "bg-blue-500 hover:bg-blue-600 text-white",
      green: "bg-green-500 hover:bg-green-600 text-white",
      gray: "bg-gray-200 hover:bg-gray-300 text-black",
    };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${colors[color]} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] via-[#111] to-black text-white p-6">
      <h2 className="text-xl mb-4 font-semibold">Bienvenido “Username”.</h2>
      <h3 className="text-center text-3xl font-bold mb-8">MIS PEDIDOS</h3>

      {/* En Camino */}
      <section>
        <h4 className="text-xl font-semibold mb-4 text-cyan-400">En Camino</h4>
        {pedidosEnCamino.map((pedido) => (
          <div
            key={pedido._id}
            className="bg-blue-900/20 border border-blue-700 rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md"
          >
            <p className="font-bold text-lg">Pedido ({pedido.nombre})</p>
            <p className="text-sm text-gray-300">Nmro de Orden: {pedido._id}</p>
            <p className="text-sm text-gray-300 mb-3">
              Dirección: {pedido.direccion}
            </p>
            <div className="flex gap-4">
              <Boton color="gray">
                <a
                  href={pedido.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <FiMapPin /> Ver Mapa
                </a>
              </Boton>
              <Boton color="green" onClick={() => marcarEntregado(pedido._id)}>
                <FiCheck /> Entregar
              </Boton>
            </div>
          </div>
        ))}
      </section>

      {/* Entregados */}
      {pedidosEntregados.length > 0 && (
        <section className="mt-10">
          <h4 className="text-xl font-semibold mb-4 text-green-400">
            Entregados
          </h4>
          {pedidosEntregados.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-green-700/20 border border-green-600 rounded-2xl p-5 mb-5 shadow-lg backdrop-blur-md"
            >
              <p className="font-bold text-lg">Pedido ({pedido.nombre})</p>
              <p className="text-sm text-gray-300">
                Nmro de Orden: {pedido._id}
              </p>
              <p className="text-sm text-gray-300 mb-3">
                Dirección: {pedido.direccion}
              </p>
              {pedido.horaEntrega && (
                <p className="text-sm text-gray-300 mb-3">
                  Hora de entrega:{" "}
                  {new Date(pedido.horaEntrega).toLocaleString()}
                </p>
              )}
              <div className="flex gap-4">
                <Boton color="gray">
                  <a
                    href={pedido.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <FiMapPin /> Ver Mapa
                  </a>
                </Boton>
                <Boton disabled color="gray">
                  <FiCheck /> Entregado
                </Boton>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
