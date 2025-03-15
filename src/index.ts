import express from "express";
import "dotenv/config";
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";
import metaRouter from "./routes/metaRoutes";
import friendshipRouter from "./routes/friendshipRoutes";
import groupRouter from "./routes/groupRoutes";
import userOnGroupRouter from "./routes/userOnGroupRoutes";
import noteRouter from "./routes/noteRoutes";
import bookRouter from "./routes/bookRoutes";
import usersOnBooksRouter from "./routes/usersOnBooksRoutes";

const app = express();

const port = process.env.PORT || 3333;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Olá Mundo" }).status(200);
});

app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/meta", metaRouter);
app.use("/friendship", friendshipRouter);
app.use("/groups", groupRouter);
app.use("/userOnGroup", userOnGroupRouter);
app.use("/books", bookRouter);
app.use("/notes", noteRouter);
app.use("/usersOnBooks", usersOnBooksRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
