import { generateToken } from "../utils/jwt";
import db from "../utils/db";
import { findUserByEmail } from "./userController";
import { compare } from "bcryptjs";
import {
  sendResetEmail,
  sendVerificationEmail,
} from "../services/emailService";
import { hashSync } from "bcryptjs";

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
      await sendVerificationEmail(existingUser.email, existingUser.verifyToken);
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Email invalido");
    }

    if (user) {
      const token = crypto.randomUUID();
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      await sendResetEmail(email, token);
    }
    res.status(200).json({ message: "Email enviado" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log(token);
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });
    if (!user)
      return res.status(400).json({ message: "Token inválido ou expirado" });

    const hash = hashSync(newPassword, 12);
    await db.user.update({
      where: { id: user.id },
      data: { password: hash, resetToken: null, resetTokenExpires: null },
    });

    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
