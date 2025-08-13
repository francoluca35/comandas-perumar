import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function GenerarReporte() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const handleGenerarExcel = async () => {
    const response = await fetch(
      `/api/reporte/excel?desde=${desde}&hasta=${hasta}`
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte.xlsx";
    link.click();
  };

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <h2 className="text-xl font-semibold">Generar reporte en Excel</h2>
      <div className="flex space-x-4">
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="border p-2 rounded"
        />
        <Button onClick={handleGenerarExcel}>Generar Excel</Button>
      </div>
    </div>
  );
}
