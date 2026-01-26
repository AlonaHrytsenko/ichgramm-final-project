import express from 'express'
import {
  createPost,
  getPosts,
  likePost,
  addComment,
  likeComment,
  deletePost,
  updatePost,
} from '../controllers/postController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()

router.post('/', auth, createPost)
router.get('/', getPosts)
router.put('/:id', auth, updatePost)
router.put('/:id/like', auth, likePost)
router.post('/:id/comment', auth, addComment)
router.put('/:postId/comments/:commentId/like', auth, likeComment)
router.delete('/:id', auth, deletePost)
export default router
