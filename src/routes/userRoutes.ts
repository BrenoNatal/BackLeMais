import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByIdAuth,
  getUserGroups,
  register,
  updateUser,
  updateUserImage,
} from "../controllers/userController";
import { isAuthenticated } from "../middlewares/authMiddleware";
import multer from "multer";

const userRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

userRouter.post("/register", register);
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.get("/user/groups/:id", getUserGroups);
userRouter.get("/user/:id", isAuthenticated, getUserByIdAuth);
userRouter.put("/user/:id", isAuthenticated, updateUser);
userRouter.delete("/user/:id", isAuthenticated, deleteUser);
userRouter.post(
  "/user/profileImage/:userId",
  upload.single("image"),
  updateUserImage
);

export default userRouter;
