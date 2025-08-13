export function validarRegistro({ username, password, foto }) {
  const errores = {};

  // 1. Usuario: máximo 15 caracteres
  if (!username || username.length < 8 || username.length > 15) {
    errores.username =
      "El nombre de usuario debe tener entre 8 y 15 caracteres.";
  }

  // 2. Contraseña: 8-20 caracteres y requisitos de seguridad

  // 3. Imagen: tamaño máximo 2MB
  if (foto && foto.size > 1 * 1024 * 1024) {
    errores.foto = "La imagen no debe pesar más de 1MB.";
  }

  return errores;
}
