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
  const destinoRef = useRef(null);
  const markerRef = useRef(null);
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
          destinoRef.current = destino;
          new window.google.maps.Marker({
            position: destino,
            map,
            title: pedido.direccion,
          });

          if (seguimientoActivo) {
            iniciarSeguimiento(
              mapRef.current,
              destinoRef.current,
              markerRef,
              directionsRendererRef
            );
          }
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido]);

  useEffect(() => {
    if (seguimientoActivo && mapRef.current && destinoRef.current) {
      iniciarSeguimiento(
        mapRef.current,
        destinoRef.current,
        markerRef,
        directionsRendererRef
      );
    }
  }, [seguimientoActivo]);

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">Dirección: {pedido.direccion}</h2>
      <div id="map" className="w-full h-[80vh] rounded-lg shadow-lg" />
      <button
        onClick={() => setSeguimientoActivo(true)}
        className="fixed bottom-4 left-4 bg-black text-white px-4 py-2 rounded-full shadow-md border border-white"
      >
        {seguimientoActivo ? "🟢 Seguimiento activo" : "Iniciar ruta"}
      </button>
    </div>
  );
}
