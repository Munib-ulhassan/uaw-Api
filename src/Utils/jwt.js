import * as jose from "jose";

export const generateToken = (payload) => {
  const token = jose.JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

export const verifyToken = (token) => {
  const decoded = jose.JWT.verify(token, process.env.JWT_SECRET);
  return decoded;
};
