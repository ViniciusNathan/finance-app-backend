import express from "express";
import {
  listAllTransactions,
  getTransactionById,
  updateTransactionById,
  createTransaction,
  deleteTransactionById,
} from "../controllers/transaction.controller.js";

const router = express.Router();
router.get("/", listAllTransactions);
router.post("/", createTransaction);

router.get("/:id", getTransactionById);
router.put("/:id", updateTransactionById);
router.delete("/:id", deleteTransactionById);

export default router;
