import bcrypt from "bcryptjs";

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(plain, hashed) {
  return await bcrypt.compare(plain, hashed);
}
