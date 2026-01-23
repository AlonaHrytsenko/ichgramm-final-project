import express from 'express'
import { getProfile, updateProfile } from '../controllers/profileController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()

router.get('/:id', getProfile)
router.put('/', auth, updateProfile)

export default router
