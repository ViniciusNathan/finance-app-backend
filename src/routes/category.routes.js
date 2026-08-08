import express from "express";
import {
  listAllCategories,
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from "../controllers/category.controller.js";

const router = express.Router();
router.get("/", listAllCategories);
router.post("/", createCategory);

router.get("/:id", getCategoryById); //Indique a função para buscar id de categoria
router.put("/:id", updateCategoryById);
router.delete("/:id", deleteCategoryById);

export default router;
