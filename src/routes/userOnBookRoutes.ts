import { Router } from "express";
import {
  getUserBooksIds,
  countUsersOnBook,
  getUserOnBookId,
  getUsersOnBooks,
  createUserOnBook,
  updateUserOnBook,
  deleteUserOnBook,
} from "../controllers/userOnBookController";

const userOnBookRouter = Router();

userOnBookRouter.get("/user/:userId/books", getUserBooksIds);
userOnBookRouter.get("/book/:bookId/users/count", countUsersOnBook);
userOnBookRouter.get("/user/:userId/book/:bookId", getUserOnBookId);
userOnBookRouter.get("/", getUsersOnBooks);
userOnBookRouter.post("/", createUserOnBook);
userOnBookRouter.put("/user/:userId/book/:bookId", updateUserOnBook);
userOnBookRouter.delete("/user/:userId/book/:bookId", deleteUserOnBook);

export default userOnBookRouter;
