"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [destino, setDestino] = useState(null);
  const [origen, setOrigen] = useState(null);
  const [directions, setDirections] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY,
    libraries: ["places"],
  });

  // Obtener pedido
  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  // Convertir mapsLink → coordenadas usando Geocoder
  useEffect(() => {
    if (pedido?.mapsLink && isLoaded) {
      const url = new URL(pedido.mapsLink);
      const query = url.searchParams.get("query"); // e.g., "Brasil 2243, Merlo"
      if (!query) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === "OK" && results[0]) {
          setDestino(results[0].geometry.location);
        } else {
          console.error("No se pudo obtener coordenadas:", status);
        }
      });
    }
  }, [pedido, isLoaded]);

  // Obtener ubicación actual y calcular ruta
  useEffect(() => {
    if (destino && isLoaded && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origenCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setOrigen(origenCoords);

          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: origenCoords,
              destination: destino,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK") {
                setDirections(result);
              } else {
                console.error("Error calculando ruta:", status);
              }
            }
          );
        },
        (err) => {
          console.error("Geolocalización no permitida", err);
        }
      );
    }
  }, [destino, isLoaded]);

  if (!pedido || !isLoaded)
    return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4 font-bold">Dirección: {pedido.direccion}</h2>
      <div className="w-full h-[80vh] rounded-lg shadow-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={destino || { lat: -34.6037, lng: -58.3816 }}
          zoom={14}
        >
          {directions ? (
            <DirectionsRenderer directions={directions} />
          ) : (
            destino && <Marker position={destino} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
