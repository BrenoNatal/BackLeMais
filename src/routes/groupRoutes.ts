import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
} from "../controllers/groupController";
import { Router } from "express";

const groupRouter = Router();

groupRouter.post("/", createGroup);
groupRouter.get("/", getGroups);
groupRouter.get("/group/:id", getGroupById);
groupRouter.put("/group/:id", updateGroup);
groupRouter.delete("/group/:id", deleteGroup);

export default groupRouter;
