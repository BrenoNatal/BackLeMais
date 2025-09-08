import { Router } from "express";
import { login, verifyEmail } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/verify-email", verifyEmail);

export default authRouter;
