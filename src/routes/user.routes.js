import express from "express";
import {
  listAllUsers,
  getUserById,
  updateUserById,
  createUser,
  deleteUserById,
  loginUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", authMiddleware, listAllUsers);
router.post("/", createUser);

router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUserById);
router.delete("/:id", authMiddleware, deleteUserById);

router.post("/login", loginUser);

export default router;
