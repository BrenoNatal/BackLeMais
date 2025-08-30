import { createPost, getPostByGroupId } from "../controllers/postController";
import { Router } from "express";

const postRouter = Router();

postRouter.post("/", createPost);
postRouter.get("/:id", getPostByGroupId);

export default postRouter;
