"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "@/app/hooks/useUbicacion";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);
  const [duracionEstimanda, setDuracionEstimanda] = useState(null);
  const mapRef = useRef(null);
  const destinoRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const usuarioMarkerRef = useRef(null);

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
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido]);

  useEffect(() => {
    if (
      seguimientoActivo &&
      mapRef.current &&
      destinoRef.current &&
      typeof window !== "undefined"
    ) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const ubicacion = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          mapRef.current.setCenter(ubicacion);
        },
        (err) => console.error("Error obteniendo ubicación inicial:", err),
        { enableHighAccuracy: true }
      );

      iniciarSeguimiento(
        mapRef.current,
        destinoRef.current,
        markerRef,
        directionsRendererRef,
        setDuracionEstimanda,
        usuarioMarkerRef
      );
    }
  }, [seguimientoActivo]);

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="relative min-h-screen">
      <div id="map" className="absolute inset-0 z-0" />

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="bg-black/90 text-white rounded-3xl p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-2">
            Cliente: {pedido.nombre}
          </h2>
          <p className="text-sm">📍 {pedido.direccion}</p>
          <p className="text-sm font-semibold mb-2">
            💰 Total: ${pedido.total}
          </p>

          {duracionEstimanda && (
            <p className="text-green-400 text-sm mb-2">
              ⏱ Tiempo estimado: <strong>{duracionEstimanda}</strong>
            </p>
          )}

          <button
            onClick={() => setSeguimientoActivo(true)}
            className="w-full bg-white text-black font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition"
          >
            {seguimientoActivo ? "🟢 Seguimiento activo" : "Iniciar ruta"}
          </button>
        </div>
      </div>
    </div>
  );
}
