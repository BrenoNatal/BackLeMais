import { generateToken } from "../utils/jwt";
import db from "../utils/db";
import { findUserByEmail } from "./userController";
import { compare } from "bcryptjs";
import { sendResetEmail } from "../services/emailService";
import { hashSync } from "bcryptjs";
import { supabase } from "../utils/supabase";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Precisa de email e senha." });
    }

    // 1. Autentica no Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Supabase login error:", authError.message);
      return res.status(403).json({ message: "Credenciais inválidas." });
    }

    const supabaseUser = authData.user;
    if (!supabaseUser) {
      return res.status(403).json({ message: "Usuário não encontrado." });
    }

    // 2. Checa se email está verificado
    if (!supabaseUser.email_confirmed_at) {
      return res
        .status(403)
        .json({ message: "Email não verificado. Cheque seu email." });
    }

    // 3. Busca usuário no Prisma
    const prismaUser = await db.user.findUnique({
      where: { id: supabaseUser.id },
    });

    if (!prismaUser) {
      return res
        .status(403)
        .json({ message: "Usuário não encontrado no banco." });
    }

    // 4. Gera JWT próprio usando suas funções
    const token = generateToken(prismaUser);

    await db.user.update({
      where: { id: prismaUser.id },
      data: { isVerified: true },
    });

    // 5. Retorna token e dados do usuário
    return res.status(200).json({
      token: token,
      userId: prismaUser.id,
      name: prismaUser.name,
    });
  } catch (error: any) {
    console.error("Erro no login:", error.message);
    return res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    return res.redirect("/email-verified.html#type=success");
  } catch (error: any) {
    return res.redirect(
      "/email-verified.html#type=error&msg=" +
        encodeURIComponent(
          error.message +
            ". Tente fazer login novamente para receber um novo email de verificação."
        )
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

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email é obrigatório." });
    }

    const redirectUrl = `${process.env.APP_URL}/reset-password.html`; // sua página frontend

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Supabase forgotPassword error:", error.message);
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      message: "E-mail de redefinição enviado. Verifique sua caixa de entrada.",
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
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
