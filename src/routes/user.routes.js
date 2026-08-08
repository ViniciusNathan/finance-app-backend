import express from 'express'
import { createUser, listAllUsers } from '../controllers/user.controller.js'

const router = express.Router()
router.post('/', createUser)
router.get('/', listAllUsers)

export default router