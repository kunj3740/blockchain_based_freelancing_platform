// lib/generateAuthToken.js
import jwt from "jsonwebtoken";

const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role || "client", // default role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export default generateAuthToken;
