import { isAuthenticated } from "../middlewares/authMiddleware";
import { createPost, getPostByGroupId } from "../controllers/postController";
import { Router } from "express";

const postRouter = Router();

postRouter.post("/", isAuthenticated, createPost);
postRouter.get("/:id", getPostByGroupId);

export default postRouter;
