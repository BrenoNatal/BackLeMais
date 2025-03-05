import { generateTokens } from "../utils/jwt";
import db from "../utils/db";
import { hashToken } from "../utils/hash";
import { findUserByEmail, findUserById } from "./userController";
import { compare } from "bcryptjs";

export const addRefreshTokenToWhiteList = (refreshToken, userId) => {
  return db.refreshToken.create({
    data: {
      hashedToken: hashToken(refreshToken),
      userId,
      expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 Dias
    },
  });
};

export const findRefreshToken = (token) => {
  return db.refreshToken.findUnique({
    where: {
      hashedToken: hashToken(token),
    },
  });
};

export const deleteRefreshTokenById = (id) => {
  return db.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
};

export const revokeTokens = (userId) => {
  return db.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
};

export const login = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.email || !userData.password) {
      res.status(400);
      throw new Error("Precisa de email e senha.");
    }

    const existingUser = await findUserByEmail(userData.email);

    if (!existingUser) {
      res.status(403);
      throw new Error("Credenciais invalidas.");
    }

    const validPassword = await compare(
      userData.password,
      existingUser.password
    );

    if (!validPassword) {
      res.status(403);
      throw new Error("Credenciais invalidas.");
    }

    const { accessToken, refreshToken } = generateTokens(existingUser);
    await addRefreshTokenToWhiteList(refreshToken, existingUser.id);

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error("Sem refresh token.");
    }
    const savedRefreshToken = await findRefreshToken(refreshToken);

    if (
      !savedRefreshToken ||
      savedRefreshToken.revoked === true ||
      Date.now() >= savedRefreshToken.expireAt.getTime()
    ) {
      res.status(401);
      throw new Error("Sem Autorização");
    }

    const user = await findUserById(savedRefreshToken.userId);
    if (!user) {
      res.status(401);
      throw new Error("Sem Autorização");
    }

    await deleteRefreshTokenById(savedRefreshToken.id);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    await addRefreshTokenToWhiteList(newRefreshToken, user.id);

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const revokeRefreshTokens = async (req, res) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Acesso revogado para o usuario de Id:#${userId}` });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};
