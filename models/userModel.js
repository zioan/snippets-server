const mongoose = require("mongoose");
const Array = mongoose.Schema.Types.Array;

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    userTags: { type: Array },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
