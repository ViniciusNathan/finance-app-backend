import express from "express";
import {
  listAllUsers,
  getUserById,
  updateUserById,
  createUser,
  deleteUserById,
  loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();
router.get("/", listAllUsers);
router.post("/", createUser);

router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

router.post("/login", loginUser)

export default router;
