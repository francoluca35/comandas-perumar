"use client";
import { useEffect, useState } from "react";

export default function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/cocina");
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000); // refresca cada 5s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return <p className="text-white text-2xl p-10">Cargando pedidos...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        📦 Pedidos en Cocina
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map((pedido, idx) => (
          <div
            key={idx}
            className="bg-white text-black rounded-2xl shadow-2xl p-6 space-y-3 text-lg"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">🪑 Mesa {pedido.mesa}</h2>
              <span className="text-sm text-gray-500">{pedido.hora}</span>
            </div>
            <p className="font-semibold">👤 {pedido.cliente}</p>
            <ul className="mt-3 space-y-1">
              {pedido.productos.map((prod, i) => (
                <li key={i} className="font-medium">
                  {prod.nombre} × {prod.cantidad}
                  {prod.adicionales?.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {" "}
                      + {prod.adicionales.join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-sm font-bold uppercase text-yellow-600 mt-2">
              Estado: {pedido.estado}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
