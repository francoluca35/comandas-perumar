"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerMapa() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [pedido, setPedido] = useState(null);
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  // Obtener el pedido
  useEffect(() => {
    if (id) {
      fetch(`/api/pedidos/${id}`)
        .then((res) => res.json())
        .then((data) => setPedido(data));
    }
  }, [id]);

  // Inicializar el mapa y marcador del cliente
  useEffect(() => {
    if (pedido && window.google) {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: { lat: -34.6037, lng: -58.3816 },
          zoom: 14,
        }
      );

      // Geocodificar la dirección del pedido
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: pedido.direccion }, (results, status) => {
        if (status === "OK") {
          const destino = results[0].geometry.location;

          new window.google.maps.Marker({
            map: mapInstance,
            position: destino,
            title: pedido.direccion,
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            },
          });

          setMap(mapInstance);
          const renderer = new window.google.maps.DirectionsRenderer();
          renderer.setMap(mapInstance);
          setDirectionsRenderer(renderer);

          // Iniciar seguimiento de ubicación
          iniciarSeguimiento(destino, mapInstance, renderer);
        } else {
          console.error("Error geocodificando:", status);
        }
      });
    }
  }, [pedido]);

  // Función para seguir al usuario en tiempo real
  const iniciarSeguimiento = (destino, mapInstance, renderer) => {
    const directionsService = new window.google.maps.DirectionsService();

    navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Mover marcador del usuario
        if (!userMarker) {
          const marker = new window.google.maps.Marker({
            position: ubicacion,
            map: mapInstance,
            title: "Tu ubicación",
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
          });
          setUserMarker(marker);
        } else {
          userMarker.setPosition(ubicacion);
        }

        // Calcular ruta desde usuario hasta destino
        directionsService.route(
          {
            origin: ubicacion,
            destination: destino,
            travelMode: "DRIVING",
          },
          (result, status) => {
            if (status === "OK") {
              renderer.setDirections(result);
            } else {
              console.error("Error calculando ruta:", status);
            }
          }
        );
      },
      (err) => {
        console.error("Error geolocalización:", err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!pedido) return <p className="text-white">Cargando mapa...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl mb-4">
        Dirección: <strong>{pedido.direccion}</strong>
      </h2>
      <div id="map" className="w-full h-[80vh] rounded-lg shadow-lg" />
    </div>
  );
}
