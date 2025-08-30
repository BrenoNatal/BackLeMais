import { Router } from "express";

import {
  getAllGoalsByUserId,
  getAllGoalsByGroupId,
  createGoal,
  deleteGoal,
  getGoalById,
  updateGoal,
  getGroupGoalsByUserId,
} from "../controllers/goalController";

const goalRouter = Router();

goalRouter.get("/user/:userId", getAllGoalsByUserId);
goalRouter.get("/group/:groupId", getAllGoalsByGroupId);
goalRouter.get("/user/group/:userId", getGroupGoalsByUserId);
goalRouter.get("/:id", getGoalById);
goalRouter.post("/", createGoal);
goalRouter.put("/:id", updateGoal);
goalRouter.delete("/:id", deleteGoal);

export default goalRouter;
