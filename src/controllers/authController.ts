import { generateToken } from "../utils/jwt";
import db from "../utils/db";
import { hashToken } from "../utils/hash";
import { findUserByEmail, findUserById } from "./userController";
import { compare } from "bcryptjs";

export const login = async (req, res) => {
  try {
    const userData = req.body;
    console.log(req.body);
    if (!userData.email || !userData.password) {
      res.status(400);
      throw new Error("Precisa de email e senha.");
    }

    const existingUser = await findUserByEmail(userData.email);

    if (!existingUser) {
      return res.status(403).json({ message: "Credenciais invalidas." });
    }

    const validPassword = await compare(
      userData.password,
      existingUser.password
    );

    if (!validPassword) {
      return res.status(403).json({ message: "Credenciais invalidas." });
    }

    const token = generateToken(existingUser);

    return res.status(200).json({
      token: token,
      userId: existingUser.id,
      name: existingUser.name,
    });
  } catch (error) {
    const err = error.message;
    console.log(err);
    return res.status(400).json({ message: err });
  }
};
