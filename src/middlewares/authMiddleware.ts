import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .json({ message: "Acesso negado: nenhum token fornecido." });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado: token inválido ou ausente." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.payload = payload;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Sessão expirada. Faça login novamente." });
    }
    return res
      .status(401)
      .json({ message: "Token inválido. Autenticação necessária." });
  }
};
