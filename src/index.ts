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

const app = express();

const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
