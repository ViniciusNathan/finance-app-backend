import express from "express";
import {
  createRecurringTransaction,
  listAllRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransactionById,
  deleteRecurringTransactionById,
} from "../controllers/recurringTransaction.controller.js";

const router = express.Router();
router.post("/", createRecurringTransaction);
router.get("/", listAllRecurringTransactions);

router.get("/:id", getRecurringTransactionById);
router.put("/:id", updateRecurringTransactionById);
router.delete("/:id", deleteRecurringTransactionById);

export default router;
