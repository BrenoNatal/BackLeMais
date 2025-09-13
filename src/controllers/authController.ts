import { generateToken } from "../utils/jwt";
import db from "../utils/db";
import { findUserByEmail } from "./userController";
import { compare } from "bcryptjs";
import { sendVerificationEmail } from "../services/emailService";
import { v4 as uuidv4 } from "uuid";

export const login = async (req, res) => {
  try {
    const userData = req.body;
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

    if (!existingUser.isVerified) {
      const verifyToken = uuidv4();
      const userData = await db.user.update({
        where: { id: existingUser.id },
        data: {
          verifyToken: verifyToken,
        },
      });

      await sendVerificationEmail(existingUser.email, userData.verifyToken);
      return res
        .status(403)
        .json({ message: "Email não verificado. Cheque seu email." });
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

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(
        "/email-verified.html?status=error&msg=Token inválido. Tente fazer login novamente para receber um novo email de verificação."
      );
    }

    const user = await db.user.findUnique({
      where: { verifyToken: token as string },
    });

    if (!user) {
      return res.redirect(
        "/email-verified.html?status=error&msg=Token inválido ou expirado. Faça login no app para que um novo email de verificação seja enviado."
      );
    }

    if (user.isVerified) {
      return res.redirect("/email-verified.html?status=already");
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    // Sucesso
    return res.redirect("/email-verified.html?status=success");
  } catch (error: any) {
    return res.redirect(
      `/email-verified.html?status=error&msg=${encodeURIComponent(
        error.message +
          ". Tente fazer login novamente para receber um novo email de verificação."
      )}`
    );
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.query;
    res.status(200).json({ message: "Usuario autenticado", verified: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, verified: false });
  }
};
