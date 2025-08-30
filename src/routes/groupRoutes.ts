import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  updateGroupImage,
} from "../controllers/groupController";
import { Router } from "express";
import multer from "multer";

const groupRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

groupRouter.post("/", createGroup);
groupRouter.get("/", getAllGroups);
groupRouter.get("/group/:id", getGroupById);
groupRouter.put("/group/:id", updateGroup);
groupRouter.delete("/group/:id", deleteGroup);
groupRouter.post(
  "/group/groupImage/:groupId",
  upload.single("image"),
  updateGroupImage
);
export default groupRouter;
