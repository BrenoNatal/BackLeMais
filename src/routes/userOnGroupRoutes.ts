import {
  createUserOnGroup,
  deleteUserOnGroup,
  getUserOnGroup,
  getUserOnGroupById,
  updateUserOnGroup,
} from "../controllers/userOnGroupController";
import { Router } from "express";

const userOnGroupRouter = Router();

userOnGroupRouter.post("/", createUserOnGroup);
userOnGroupRouter.get("/", getUserOnGroup);
userOnGroupRouter.get("/:groupId/:userId", getUserOnGroupById);
userOnGroupRouter.put("/:groupId/:userId", updateUserOnGroup);
userOnGroupRouter.delete("/:groupId/:userId", deleteUserOnGroup);

export default userOnGroupRouter;
