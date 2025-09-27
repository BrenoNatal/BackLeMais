import nodemailer from "nodemailer";

// Configuração do transporter para Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // use 465 se quiser SSL
  secure: false, // true se porta 465
  auth: {
    user: process.env.EMAIL_USER, // seu e-mail Gmail
    pass: process.env.EMAIL_PASS, // senha de app (recomendado) ou senha real
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  console.log("Tentando enviar email de verificação...");

  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"LeMais 📚" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Confirme seu e-mail",
      html: `
        <h1>Bem-vindo ao LeMais 📚</h1>
        <p>Clique no botão abaixo para confirmar seu e-mail:</p>
        <a href="${verificationUrl}" style="
          background: #5B88A5;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
        ">
          Confirmar E-mail
        </a>
      `,
    });
    console.log(`E-mail de verificação enviado para ${to}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail de verificação:", error);
    throw new Error("Não foi possível enviar o e-mail de verificação.");
  }
};

export const sendResetEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.APP_URL}/reset-password.html?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"LeMais Suporte" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Redefinição de Senha",
      html: `
        <p>Olá,</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${resetUrl}" target="_blank" style="
          background: #5B88A5;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
        ">Redefinir Senha</a></p>
        <p>Se você não solicitou, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Equipe do LeMais</p>
      `,
    });
    console.log(`E-mail de redefinição enviado para ${to}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição:", error);
    throw new Error(
      "Não foi possível enviar o e-mail de redefinição de senha."
    );
  }
};
