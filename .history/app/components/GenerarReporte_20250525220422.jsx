"use client";
import { useState } from "react";
import { Input, Button, Spinner, Card, CardBody } from "@nextui-org/react";

export default function ReportePorFecha() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(false);

  const descargar = async () => {
    if (!desde || !hasta) {
      alert("Seleccioná ambas fechas");
      return;
    }

    setLoading(true);
    try {
      const url = `/api/reporte?desde=${desde}&hasta=${hasta}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error en descarga");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "clientes_rango.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (error) {
      alert("Error al descargar el archivo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="max-w-2xl w-full p-6 bg-white/80 backdrop-blur-md shadow-xl rounded-3xl"
      isBlurred
    >
      <CardBody className="flex flex-col md:flex-row gap-4 items-center">
        <Input
          type="date"
          label="Desde"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="w-full md:w-1/3"
          radius="lg"
          variant="bordered"
          isRequired
        />
        <Input
          type="date"
          label="Hasta"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="w-full md:w-1/3"
          radius="lg"
          variant="bordered"
          isRequired
        />
        <Button
          onClick={descargar}
          isLoading={loading}
          radius="lg"
          size="lg"
          color="secondary"
          className="w-full md:w-1/3 font-semibold"
        >
          {loading ? "Descargando..." : "Descargar Excel"}
        </Button>
      </CardBody>
    </Card>
  );
}
