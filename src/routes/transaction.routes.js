import express from "express";
import {
  listAllTransactions,
  getTransactionById,
  updateTransactionById,
  createTransaction,
  deleteTransactionById,
} from "../controllers/transaction.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", authMiddleware, listAllTransactions);
router.post("/", authMiddleware, createTransaction);

router.get("/:id", authMiddleware, getTransactionById);
router.put("/:id", authMiddleware, updateTransactionById);
router.delete("/:id", authMiddleware, deleteTransactionById);

export default router;
