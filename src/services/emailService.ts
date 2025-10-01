import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ou SMTP da sua escolha
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"LeMais" <${process.env.EMAIL_USER}>`,
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
};

export const sendResetEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // ou SMTP da sua escolha
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Link de redefinição de senha
  const resetUrl = `${process.env.APP_URL}/reset-password.html?token=${token}`;

  // Corpo do e-mail
  const mailOptions = {
    from: `"Suporte App" <${process.env.EMAIL_USER}>`,
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
  };

  // Envio do e-mail
  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de redefinição enviado para ${to}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinição:", error);
    throw new Error(
      "Não foi possível enviar o e-mail de redefinição de senha."
    );
  }
};
