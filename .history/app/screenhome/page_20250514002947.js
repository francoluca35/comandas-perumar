import PrivateRoute from "../components/PrivateRoute";

export default function ScreenHome() {
  return (
    <PrivateRoute>
      <main className="p-4">
        <h1 className="text-2xl font-bold text-white">
          Bienvenido a la pantalla protegida 🎉
        </h1>
      </main>
    </PrivateRoute>
  );
}
