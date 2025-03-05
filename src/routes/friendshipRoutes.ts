import { createFriendship } from "../controllers/friendshipController";
import { Router } from "express";

const friendshipRouter = Router();

friendshipRouter.post("/", createFriendship);

export default friendshipRouter;
