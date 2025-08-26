"use client";

import { useState, useEffect, Suspense } from "react";
import PrivateRoute from "../models/PrivateRoute";
import { useAuth } from "@/context/AuthContext";
import TablaMetrica from "../components/ui/TablaMetrica";
import BotonesMenu from "../components/ui/BotonesMenu";
import UserDropdown from "../components/ui/UserDropdown";
import AbrirCaja from "../components/ui/AbrirCaja";
import { db } from "@/lib/firebase";
import { onValue, ref, remove } from "firebase/database";

export default function ScreenHome() {
  const { user } = useAuth();
  const fecha = new Date().toLocaleDateString("es-AR");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ticketsPendientes, setTicketsPendientes] = useState([]);

  useEffect(() => {
    if (user?.rol === "admin") {
      const mostrarAlIniciar = sessionStorage.getItem("mostrarCaja");

      if (mostrarAlIniciar === "true") {
        setMostrarModal(true);
        sessionStorage.removeItem("mostrarCaja");
      }

      const handleAbrirCaja = () => {
        setMostrarModal(true);
      };

      window.addEventListener("abrirCaja", handleAbrirCaja);

      const ticketsRef = ref(db, "tickets");
      const unsubscribe = onValue(ticketsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const ticketsPend = [];

        Object.entries(data).forEach(([mesa, ticket]) => {
          if (ticket.estado === "pendiente") {
            const tiempo = new Date(ticket.hora);
            const ahora = new Date();
            const diferenciaMinutos = (ahora - tiempo) / 60000;

            ticketsPend.push({ ...ticket, mesa });

            if (diferenciaMinutos > 3) {
              alert(
                `⚠️ ¡Hace más de 3 minutos que la Mesa ${mesa} pagó! Imprimí el ticket.`
              );
            }
          }
        });

        setTicketsPendientes(ticketsPend);
      });

      return () => {
        window.removeEventListener("abrirCaja", handleAbrirCaja);
        unsubscribe();
      };
    }
  }, [user]);

  const imprimirTicket = async (ticket) => {
    const { mesa, productos, metodo, total } = ticket;
    
    try {
      // Enviar a la impresora térmica
      const response = await fetch("/api/print-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesa: mesa,
          productos: productos,
          total: total,
          metodoPago: metodo,
          nombreCliente: "Cliente",
          propina: 0,
          descuento: 0,
        }),
      });

      if (response.ok) {
        // Eliminar ticket de Firebase después de imprimir
        try {
          await remove(ref(db, `tickets/${mesa}`));
          console.log("✅ Ticket eliminado de Firebase");
        } catch (error) {
          console.error("❌ Error al eliminar ticket:", error);
        }
        
        // Mostrar confirmación
        Swal.fire({
          icon: "success",
          title: "Ticket impreso",
          text: "El ticket se imprimió correctamente en la impresora térmica",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Error al imprimir");
      }
    } catch (error) {
      console.error("❌ Error al imprimir ticket:", error);
      Swal.fire({
        icon: "error",
        title: "Error al imprimir",
        text: "No se pudo imprimir el ticket. Verifica que el servidor de impresión esté funcionando.",
      });
    }
  };

  return (
    <PrivateRoute>
      <main className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950 p-6 text-white flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">
            Bienvenido {user?.nombreCompleto} - {fecha}
          </h2>
          <UserDropdown onAbrirCaja={() => setMostrarModal(true)} />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 flex-grow">
          <Suspense
            fallback={<p className="text-gray-400">Cargando menú...</p>}
          >
            <BotonesMenu />
          </Suspense>

          {ticketsPendientes.length > 0 && (
            <div className="fixed right-4 top-24 z-50 flex flex-col gap-6">
              {ticketsPendientes.slice(0, 4).map((ticket) => (
                <div
                  key={ticket.mesa}
                  className="bg-yellow-300 text-black p-4 rounded-xl shadow-xl w-72"
                >
                  <h2 className="text-lg font-bold">🧾 Ticket pendiente</h2>
                  <p>Mesa: {ticket.mesa}</p>
                  <p>Total: ${ticket.total.toFixed(2)}</p>
                  <p>Pago: {ticket.metodo || "–"}</p>
                  <button
                    onClick={() => imprimirTicket(ticket)}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg font-semibold"
                  >
                    🖨️ Imprimir ticket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <AbrirCaja
          visible={mostrarModal}
          onClose={() => setMostrarModal(false)}
        />
      </main>
    </PrivateRoute>
  );
}
