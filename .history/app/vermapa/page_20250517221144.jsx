"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY,
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  if (!isLoaded || !pedido)
    return <p className="text-white">Cargando mapa...</p>;

  const center = {
    lat: pedido.coordenadas?.lat || -34.6037,
    lng: pedido.coordenadas?.lng || -58.3816,
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">Dirección: {pedido.direccion}</h2>
      <div className="w-full h-[80vh] rounded-lg overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={14}
        >
          <Marker position={center} title={pedido.direccion} />
        </GoogleMap>
      </div>
    </div>
  );
}
