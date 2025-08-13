import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Hasheada con bcrypt
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
