import express from "express";
import {
  listAllCategories,
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from "../controllers/category.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/", authMiddleware, listAllCategories);
router.post("/", authMiddleware, createCategory);

router.get("/:id", authMiddleware, getCategoryById); //Indique a função para buscar id de categoria
router.put("/:id", authMiddleware, updateCategoryById);
router.delete("/:id", authMiddleware, deleteCategoryById);

export default router;
