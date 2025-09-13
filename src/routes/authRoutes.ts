import { Router } from "express";
import { login, verifyEmail, verifyToken } from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/verify-email", verifyEmail);
authRouter.get("/verify-token", isAuthenticated, verifyToken);

export default authRouter;
