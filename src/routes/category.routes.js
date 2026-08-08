import express from 'express'
import { listAllCategories, createCategory, getCategoryById, updateCategoryById, deleteCategoryById } from '../controllers/category.controller.js'

const router = express.Router()
router.get('/', listAllCategories)
router.get('/:id', getCategoryById) //Indique a função para buscar id de categoria
router.put('/:id', updateCategoryById)
router.post('/', createCategory)
router.delete('/:id', deleteCategoryById)

export default router