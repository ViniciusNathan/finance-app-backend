import express from "express";
import {
  listAllUsers,
  getUserById,
  updateUserById,
  createUser,
  deleteUserById,
} from "../controllers/user.controller.js";

const router = express.Router();
router.get("/", listAllUsers);
router.post("/", createUser);

router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

export default router;
