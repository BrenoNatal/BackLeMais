import { Router } from "express";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "../controllers/bookController";

const bookRouter = Router();

bookRouter.post("/", createBook);

bookRouter.get("/:id", getBookById);
bookRouter.get("/", getAllBooks);
bookRouter.put("/:id", updateBook);
bookRouter.delete("/:id", deleteBook);

export default bookRouter;
