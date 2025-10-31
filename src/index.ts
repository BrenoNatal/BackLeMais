import express, { Request } from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";
import goalRouter from "./routes/goalRoutes";
import friendshipRouter from "./routes/friendshipRoutes";
import groupRouter from "./routes/groupRoutes";
import userOnGroupRouter from "./routes/userOnGroupRoutes";
import noteRouter from "./routes/noteRoutes";
import bookRouter from "./routes/bookRoutes";
import userOnBookRouter from "./routes/userOnBookRoutes";
import postRouter from "./routes/postRoutes";
import categoryRouter from "./routes/categoryRoutes";
import bookCategoryOnBookRouter from "./routes/bookCategoryOnBookRoutes";
import achievementRouter from "./routes/achievementRoutes";
import userStreakRouter from "./routes/userStreakRoutes";
import path from "path";
import http from "http";
import https from "https";

const app = express();

const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.json({ message: "Olá Mundo" }).status(200);
});

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/goal", goalRouter);
app.use("/friendship", friendshipRouter);
app.use("/groups", groupRouter);
app.use("/userOnGroup", userOnGroupRouter);
app.use("/books", bookRouter);
app.use("/notes", noteRouter);
app.use("/categories", categoryRouter);
app.use("/bookCategoryOnBook", bookCategoryOnBookRouter);
app.use("/userOnBook", userOnBookRouter);
app.use("/post", postRouter);
app.use("/achievements", achievementRouter);
app.use("/userStreak", userStreakRouter);

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);

  // chama função keepAlive depois que o servidor inicia
  keepAlive();
});

/**
 * Função que faz ping periódico para manter a instância Render acordada.
 * Usa apenas módulos nativos do Node.js (http/https).
 */

function keepAlive() {
  const url = process.env.APP_URL;
  const interval = 4 * 60 * 1000; // 4 minutos

  console.log("⏱️ Keep-alive iniciado:", url);

  setInterval(() => {
    const client = url.startsWith("https") ? https : http;
    1;
    const req = client.get(url, (res) => {
      console.log(`[${new Date().toISOString()}] Ping OK (${res.statusCode})`);
      // consome o body para evitar memory leak
      res.on("data", () => {});
      res.on("end", () => {});
    });

    req.on("error", (err) => {
      console.error(
        `[${new Date().toISOString()}] Falha no ping: ${err.message}`
      );
    });

    req.end();
  }, interval);
}
