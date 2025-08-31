import { getUserStreak } from "../controllers/userStreakController";
import { Router } from "express";

const userStreakRouter = Router();

userStreakRouter.get("/user/:userId/streak", getUserStreak);

export default userStreakRouter;
