export default function TablaMetrica() {
  return (
    <div className="bg-white text-black rounded overflow-hidden shadow-lg w-full max-w-md">
      <table className="w-full table-auto text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Métrica</th>
            <th className="p-2 text-center">Diario</th>
            <th className="p-2 text-center">Semanal</th>
            <th className="p-2 text-center">Mensual</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2">Clientes</td>
            <td className="p-2 text-center">55</td>
            <td className="p-2 text-center">320</td>
            <td className="p-2 text-center">1.254</td>
          </tr>
          <tr className="border-t">
            <td className="p-2">Pedidos</td>
            <td className="p-2 text-center">20</td>
            <td className="p-2 text-center">165</td>
            <td className="p-2 text-center">318</td>
          </tr>
          <tr className="border-t font-semibold">
            <td className="p-2">Ingresos Totales</td>
            <td className="p-2 text-center">€1.950</td>
            <td className="p-2 text-center">€13.870</td>
            <td className="p-2 text-center">€45.687</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
