import { Router } from "express";
import {
  getDBBookByOLId,
  getBookById,
  getAllBooks,
  getUserBooksByIds,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController";

const bookRouter = Router();

bookRouter.get("/byOLId", getDBBookByOLId);
bookRouter.get("/:id", getBookById);
bookRouter.get("/", getAllBooks);
bookRouter.post("/byIds", getUserBooksByIds); //Como recebe um array grande de IDs, o método é POST
bookRouter.post("/", createBook);
bookRouter.put("/:id", updateBook);
bookRouter.delete("/:id", deleteBook);

export default bookRouter;
