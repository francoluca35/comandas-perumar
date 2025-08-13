import PrivateRoute from "../components/PrivateRoute";

export default function ScreenHome() {
  return (
    <PrivateRoute>
      <h1>hola</h1>
    </PrivateRoute>
  );
}
