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
