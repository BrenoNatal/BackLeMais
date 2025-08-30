import { Router } from "express";
import {
  getBookCategoriesOnBook,
  setBookCategoriesOnBook,
} from "../controllers/bookCategoryOnBookController";

const bookCategoryOnBookRouter = Router();

bookCategoryOnBookRouter.get("/user/:userId/book/:bookId", getBookCategoriesOnBook);
bookCategoryOnBookRouter.post("/setBookCategories", setBookCategoriesOnBook);

export default bookCategoryOnBookRouter;