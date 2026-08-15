import express from 'express'
import categoryRoutes from './category.routes.js'
import userRoutes from './user.routes.js'
import transactionRoutes from './transaction.routes.js'
import recurringTransactions from './recurringTransaction.routes.js'

// "mapa geral" da API, não cria nada, mas direciona para o route da requisição

const router = express.Router()
router.use('/categories', categoryRoutes)
router.use('/users', userRoutes)
router.use('/transactions', transactionRoutes)
router.use('/recurring-transactions', recurringTransactions)

export default router