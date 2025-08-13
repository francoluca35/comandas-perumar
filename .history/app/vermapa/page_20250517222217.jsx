"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useUbicacion from "../hooks/useUbicacion";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const { iniciarSeguimiento } = useUbicacion({
    onUbicacion: (pos, map) => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new window.google.maps.Marker({
        position: pos,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2196f3",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white",
        },
      });
    },
    onRuta: (origen, destino, map) => {
      const directionsService = new window.google.maps.DirectionsService();
      if (!directionsRendererRef.current) {
        directionsRendererRef.current =
          new window.google.maps.DirectionsRenderer();
        directionsRendererRef.current.setMap(map);
      }
      directionsService.route(
        {
          origin: origen,
          destination: destino,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error("Error calculando ruta:", status);
          }
        }
      );
    },
  });

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
          iniciarSeguimiento(map, destino);
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
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
