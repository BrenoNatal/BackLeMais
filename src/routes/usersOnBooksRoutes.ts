import { Router } from "express";
import {
  createUserOnBook,
  deleteUserOnBook,
  getUserOnBook,
  getUserOnBookId,
  updateUserOnBook,
} from "../controllers/usersOnBooksController";

const usersOnBooksRouter = Router();

usersOnBooksRouter.post("/", createUserOnBook);
usersOnBooksRouter.get("/", getUserOnBook);
usersOnBooksRouter.get("/:bookId/:userId", getUserOnBookId);
usersOnBooksRouter.put("/:bookId/:userId", updateUserOnBook);
usersOnBooksRouter.delete("/:bookId/:userId", deleteUserOnBook);

export default usersOnBooksRouter;
