"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  useEffect(() => {
    if (pedido && window.google) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.6037, lng: -58.3816 }, // puede ser posición por defecto
        zoom: 14,
      });

      const destino = new window.google.maps.LatLng(
        pedido.coordenadas.lat,
        pedido.coordenadas.lng
      );

      new window.google.maps.Marker({
        position: destino,
        map,
        title: pedido.direccion,
      });

      // Dirección en vivo si querés usar DirectionsRenderer...
    }
  }, [pedido]);

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">Dirección: {pedido.direccion}</h2>
      <div id="map" className="w-full h-[80vh] rounded-lg shadow-lg" />
    </div>
  );
}
