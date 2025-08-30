import {
  acceptFriendship,
  createFriendship,
  deleteFriendship,
  getAllFriendshipsRequests,
  getAllUserFriendships,
  checkFriendships,
  deleteAllFriendship,
} from "../controllers/friendshipController";
import { Router } from "express";

const friendshipRouter = Router();

friendshipRouter.post("/", createFriendship);
friendshipRouter.get("/:userId", getAllUserFriendships);
friendshipRouter.get("/friendshipsRequests/:userId", getAllFriendshipsRequests);
friendshipRouter.put("/:friendId/:userId", acceptFriendship);
friendshipRouter.get("/checkFriendship/:friendId/:userId", checkFriendships);
friendshipRouter.delete("/:friendId/:userId", deleteFriendship);
friendshipRouter.delete("", deleteAllFriendship);

export default friendshipRouter;
