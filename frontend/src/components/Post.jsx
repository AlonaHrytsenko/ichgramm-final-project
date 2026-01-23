import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa'
import { formatDistanceToNowStrict } from 'date-fns' // Импорт для времени
import './Post.css'

const Post = ({ post, currentUserId, onImageClick }) => {
  const [likes, setLikes] = useState(post.likes)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(post.comments || [])

  // Состояние подписки (изначально берем из данных поста о пользователе)
  // Важно: бэкенд должен присылать в post.user массив followers
  const [isFollowing, setIsFollowing] = useState(
    post.user.followers?.some(
      (id) => id.toString() === currentUserId?.toString(),
    ),
  )

  const isLiked = likes.includes(currentUserId)

  // --- Функция Лайка ---
  const handleLike = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setLikes(res.data.likes)
    } catch (err) {
      console.error('Ошибка лайка', err)
    }
  }

  // --- Функция Подписки ---
  const handleFollow = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/${post.user._id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      // Бэкенд возвращает статус после действия (isFollowing: true/false)
      setIsFollowing(res.data.isFollowing)
    } catch (err) {
      console.error('Ошибка подписки', err)
    }
  }

  // --- Функция Комментария ---
  const handleComment = async () => {
    if (!comment.trim()) return
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setComments(res.data.comments)
      setComment('')
    } catch (err) {
      console.error('Ошибка комментария', err)
    }
  }

  // --- Форматирование времени (аналог Instagram) ---
  const timeAgo = formatDistanceToNowStrict(new Date(post.createdAt), {
    addSuffix: false,
  })
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd')
    .replace(' months', 'mo')
    .replace(' month', 'mo')

  const formatLikes = (count) =>
    count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return (
    <div className="instagram-post">
      <div className="post-header">
        <Link to={`/profile/${post.user._id}`}>
          <img
            src={post.user.avatar || 'https://via.placeholder.com/150'}
            className="avatar"
            alt="user"
          />
        </Link>
        <div className="user-info">
          <Link to={`/profile/${post.user._id}`} className="username-link">
            <span className="username">{post.user.username}</span>
          </Link>
          <span className="post-time">• {timeAgo}</span>
        </div>

        {/* Кнопка подписки (не показываем, если это наш пост) */}
        {currentUserId !== post.user._id && (
          <button
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <img
        src={post.image}
        onClick={onImageClick}
        className="post-image"
        alt="post"
      />

      <div className="post-content">
        <div className="post-actions">
          <div onClick={handleLike} style={{ cursor: 'pointer' }}>
            {isLiked ? (
              <FaHeart color="#ed4956" size={24} />
            ) : (
              <FaRegHeart size={24} />
            )}
          </div>
          <FaRegComment size={24} />
        </div>

        <div className="likes-count">{formatLikes(likes.length)} likes</div>

        <div className="caption">
          <span className="username">{post.user.username}</span>
          <span dangerouslySetInnerHTML={{ __html: post.caption }}></span>
        </div>

        <div className="view-all">View all {comments.length} comments</div>

        {comments.slice(-2).map((c, index) => (
          <div key={index} className="comment-item">
            <span className="username">{c.user?.username}</span> {c.text}
          </div>
        ))}

        <div className="comment-input-area">
          <input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
          />
          <button
            onClick={handleComment}
            disabled={!comment.trim()}
            style={{ opacity: comment.trim() ? 1 : 0.5 }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default Post
