import { Router } from "express";
import {
  login,
  refreshToken,
  revokeRefreshTokens,
} from "../controllers/authController";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/refreshToken", refreshToken);

authRouter.post("/revokeRefreshTokens", revokeRefreshTokens);

export default authRouter;
