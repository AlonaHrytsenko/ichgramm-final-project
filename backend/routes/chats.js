import express from 'express'
const router = express.Router()
import { getChats, createChat } from '../controllers/chatController.js'
import auth from '../middlewares/auth.js' // Твой мидлвар проверки токена

router.get('/', auth, getChats)
router.post('/', auth, createChat)

export default router
