import express from 'express'
import categoryRoutes from './category.routes.js'
import userRoutes from './user.routes.js'

// "mapa geral" da API, não cria nada, mas direciona para o route da requisição

const router = express.Router()
router.use('/categories', categoryRoutes)
router.use('/users', userRoutes)

export default router