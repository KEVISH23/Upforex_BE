import jwt from "jsonwebtoken";

const JWT_SECRET = "UpFoRexTradIng123456";

export const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token.");
  }
};
