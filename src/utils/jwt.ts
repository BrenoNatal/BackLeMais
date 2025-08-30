import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "30d",
  });
};

export const generateToken = (user) => {
  const token = generateAccessToken(user);
  return token;
};
