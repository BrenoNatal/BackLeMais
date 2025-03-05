import { hashSync } from "bcryptjs";
import { hashToken } from "../utils/hash";
import db from "../utils/db";
import { generateTokens } from "../utils/jwt";
import { addRefreshTokenToWhiteList } from "./authController";

export const findUserByEmail = (email) => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserById = (userId) => {
  return db.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const register = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.email || !userData.password) {
      res.status(400);
      throw new Error("Precisa de email e senha.");
    }

    userData.password = hashSync(userData.password, 12);

    const user = await db.user.create({
      data: userData,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    await addRefreshTokenToWhiteList(refreshToken, user.id);

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

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await db.user.findMany({
      include: {
        metas: true,
        friendOf: true,
        friends: true,
      },
    });

    res.status(200).json({ data: allUsers });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    res.status(200).json({ data: user });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;

    const user = await db.user.update({
      where: {
        id: userId,
      },
      data: userData,
    });
    res.status(200).json({ data: user });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({ message: "Usuario deletado com sucesso." });
  } catch (error) {
    const err = error.message;
    console.log(err);
    res.status(400).json({ message: err });
  }
};
