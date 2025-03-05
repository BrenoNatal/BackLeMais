import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  register,
  updateUser,
} from "../controllers/userController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.get("/", getAllUsers);
userRouter.get("/user/:id", isAuthenticated, getUserById);
userRouter.put("/user/:id", isAuthenticated, updateUser);
userRouter.delete("/user/:id", isAuthenticated, deleteUser);

export default userRouter;
