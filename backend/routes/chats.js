import express from 'express'
const router = express.Router()
import { getChats, createChat } from '../controllers/chatController.js'
import auth from '../middlewares/auth.js'

router.get('/', auth, getChats)
router.post('/', auth, createChat)

export default router
