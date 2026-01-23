import express from 'express'
import {
  searchUsers,
  getUserById,
  followUser,
} from '../controllers/userController.js'
import auth from '../middlewares/auth.js'
const router = express.Router()

router.get('/', searchUsers)
router.get('/:id', getUserById)
router.post('/:id/follow', auth, followUser)

export default router
