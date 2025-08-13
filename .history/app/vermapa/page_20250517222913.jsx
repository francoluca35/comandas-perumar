"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "@/app/hooks/useUbicacion";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);

  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const { iniciarSeguimiento } = useUbicacion();

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
        center: { lat: -34.6037, lng: -58.3816 },
        zoom: 14,
      });
      mapRef.current = map;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: pedido.direccion }, (results, status) => {
        if (status === "OK") {
          const destino = results[0].geometry.location;

          new window.google.maps.Marker({
            position: destino,
            map,
            title: pedido.direccion,
          });

          const directionsRenderer =
            new window.google.maps.DirectionsRenderer();
          directionsRenderer.setMap(map);
          directionsRendererRef.current = directionsRenderer;

          // Guardamos el destino para usarlo luego al apretar el botón
          mapRef.current.destino = destino;
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido]);

  const handleIniciarRuta = () => {
    if (
      mapRef.current &&
      mapRef.current.destino &&
      directionsRendererRef.current
    ) {
      setSeguimientoActivo(true);
      iniciarSeguimiento(
        mapRef.current,
        mapRef.current.destino,
        directionsRendererRef.current
      );
    }
  };

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">Dirección: {pedido.direccion}</h2>

      <div className="mb-4">
        <button
          onClick={handleIniciarRuta}
          disabled={seguimientoActivo}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow-md disabled:opacity-50"
        >
          {seguimientoActivo ? "Seguimiento activo" : "Comenzar ruta"}
        </button>
      </div>

      <div id="map" className="w-full h-[80vh] rounded-lg shadow-lg" />
    </div>
  );
}
