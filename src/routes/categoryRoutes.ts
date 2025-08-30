import { Router } from "express";
import {
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const categoryRouter = Router();

categoryRouter.get("/user/:userId/type/:type", getCategoriesByUser);
categoryRouter.post("/", createCategory);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);

export default categoryRouter;