import express from 'express'
import { getMessages } from '../controllers/messageController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()

// Получить историю сообщений конкретного чата по его ID
router.get('/:chatId', auth, getMessages)

export default router
