import express from 'express'
import { getMessages } from '../controllers/messageController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()

router.get('/:chatId', auth, getMessages)

export default router
