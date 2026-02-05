import Post from '../models/Post.js'
import Notification from '../models/Notification.js'

export const createPost = async (req, res) => {
  try {
    const userId = req.userId
    const { caption, image } = req.body

    if (!image) {
      return res.status(400).json({ message: 'Image is required' })
    }

    const newPost = new Post({
      user: userId,
      caption,
      image,
    })

    await newPost.save()
    const populatedPost = await newPost.populate('user', 'username avatar')
    res.status(201).json(populatedPost)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getPosts = async (req, res) => {
  try {
    const { user } = req.query
    const queryFilter = user ? { user: user } : {}

    const posts = await Post.find(queryFilter)
      .populate('user', 'username avatar followers')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error fetching posts' })
  }
}
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params
    const { caption } = req.body
    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' })
    }
    if (post.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'Вы можете редактировать только свои посты' })
    }

    post.caption = caption
    await post.save()
    const updatedPost = await Post.findById(id).populate(
      'user',
      'username avatar',
    )
    res.status(200).json(updatedPost)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка при обновлении поста' })
  }
}
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Пост не найден' })
    }

    if (post.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: 'У вас нет прав на удаление этого поста' })
    }

    await post.deleteOne() // Удаляем пост

    res.json({ message: 'Пост успешно удален' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка при удалении поста' })
  }
}

export const likePost = async (req, res) => {
  try {
    const userId = req.userId
    const post = await Post.findById(req.params.id)

    if (!post) return res.status(404).json({ message: 'Post not found' })

    const isLiked = post.likes.includes(userId)

    if (!isLiked) {
      post.likes.push(userId)
      if (post.user.toString() !== userId) {
        const notification = new Notification({
          user: post.user,
          type: 'like',
          fromUser: userId,
          post: post._id,
        })
        await notification.save()
      }
    } else {
      post.likes.pull(userId)
    }

    await post.save()
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: 'Like error' })
  }
}

export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    const userId = req.userId

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const newComment = { user: userId, text }
    post.comments.push(newComment)

    if (post.user.toString() !== userId) {
      const notification = new Notification({
        user: post.user,
        type: 'comment',
        fromUser: userId,
        post: post._id,
      })
      await notification.save()
    }

    await post.save()

    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')

    res.json(updatedPost)
  } catch (err) {
    res.status(500).json({ message: 'Comment error' })
  }
}

export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const post = await Post.findById(postId)

    if (!post) return res.status(404).json({ message: 'Пост не найден' })

    const comment = post.comments.id(commentId)
    if (!comment)
      return res.status(404).json({ message: 'Комментарий не найден' })

    if (comment.likes.includes(req.userId)) {
      comment.likes = comment.likes.filter((id) => id.toString() !== req.userId)
    } else {
      comment.likes.push(req.userId)
    }

    await post.save()

    const updatedPost = await Post.findById(postId).populate(
      'comments.user',
      'username avatar',
    )
    res.json({ comments: updatedPost.comments })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
}
