import { Router } from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  verifyEmail,
  verifyToken,
} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/verify-email", verifyEmail);
authRouter.get("/verify-token", isAuthenticated, verifyToken);
authRouter.post("/forgotPassword", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
