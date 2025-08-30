import { Router } from "express"; // Use esta importação
import {
  getUserAchievements,
  calculateUserAchievements,
} from "../controllers/achievementController";

const router = Router(); // Use esta forma de criar o router

router.get("/:userId", getUserAchievements); // Agora pode usar diretamente
router.post("/calculate/:userId", calculateUserAchievements);

export default router;
