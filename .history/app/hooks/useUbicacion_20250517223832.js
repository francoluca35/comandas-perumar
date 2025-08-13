"use client";
export default function useUbicacion() {
  const iniciarSeguimiento = (
    map,
    destino,
    markerRef,
    directionsRendererRef
  ) => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    // ⚠️ Asegurarse que directionsRendererRef esté correctamente inicializado
    if (
      !directionsRendererRef.current ||
      typeof directionsRendererRef.current.setDirections !== "function"
    ) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          suppressMarkers: true,
        }
      );
      directionsRendererRef.current.setMap(map);
    }

    // Iniciar seguimiento
    navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Crear o mover marcador azul del usuario
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: ubicacion,
            map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            title: "Tu ubicación",
          });
        } else {
          markerRef.current.setPosition(ubicacion);
        }

        // Calcular ruta en cada movimiento
        directionsService.route(
          {
            origin: ubicacion,
            destination: destino,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK") {
              directionsRendererRef.current.setDirections(result);
            } else {
              console.error("Error al calcular ruta:", status);
            }
          }
        );
      },
      (err) => console.error("Error en geolocalización:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { iniciarSeguimiento };
}
