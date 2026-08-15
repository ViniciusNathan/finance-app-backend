import express from "express";
import {
  createRecurringTransaction,
  listAllRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransactionById,
  deleteRecurringTransactionById,
} from "../controllers/recurringTransaction.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/", authMiddleware, createRecurringTransaction);
router.get("/", authMiddleware, listAllRecurringTransactions);

router.get("/:id", authMiddleware, getRecurringTransactionById);
router.put("/:id", authMiddleware, updateRecurringTransactionById);
router.delete("/:id", authMiddleware, deleteRecurringTransactionById);

export default router;
