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
  const [directions, setDirections] = useState(null);
  const [origen, setOrigen] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  useEffect(() => {
    if (pedido && isLoaded && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origenCoord = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setOrigen(origenCoord);

          const destinoCoord = {
            lat: pedido.coordenadas?.lat,
            lng: pedido.coordenadas?.lng,
          };

          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: origenCoord,
              destination: destinoCoord,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === "OK") {
                setDirections(result);
              } else {
                console.error("Error obteniendo ruta", result);
              }
            }
          );
        },
        (err) => {
          console.error("Geolocalización no permitida", err);
        }
      );
    }
  }, [pedido, isLoaded]);

  if (!isLoaded || !pedido)
    return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4 font-bold">Destino: {pedido.direccion}</h2>
      <div className="w-full h-[80vh] rounded-lg overflow-hidden shadow-lg">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={pedido.coordenadas || { lat: -34.6037, lng: -58.3816 }}
          zoom={14}
        >
          {directions ? (
            <DirectionsRenderer directions={directions} />
          ) : (
            <Marker position={pedido.coordenadas} title={pedido.direccion} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
