import PrivateRoute from "../components/PrivateRoute";

export default function screenhome() {
  return (
    <PrivateRoute>
      <h1>hola</h1>
    </PrivateRoute>
  );
}
