import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaTimes,
  FaEllipsisH,
  FaUserCircle,
} from 'react-icons/fa'
import { formatDistanceToNowStrict } from 'date-fns'
import axios from 'axios'
import smile from '../assets/smile.svg'
import './PostModal.css'

const PostModal = ({
  post,
  onClose,
  currentUserId,
  onPostUpdate,
  onDelete,
  onEdit,
  onFollowUpdate,
}) => {
  const [likes, setLikes] = useState(post?.likes || [])
  const [showMenu, setShowMenu] = useState(false)
  const isFollowing =
    post?.user?.followers?.some(
      (id) => id.toString() === currentUserId?.toString(),
    ) || false
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(post?.comments || [])
  const [showEmoji, setShowEmoji] = useState(false)
  const emojis = ['😊', '❤️', '😂', '🙌', '🔥', '😍', '✨', '👏']
  const isLiked = likes.includes(currentUserId)
  const isOwnPost = post.user._id === currentUserId

  const handleCopyLink = () => {
    const link = `${window.location.origin}/post/${post._id}`
    navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
    setShowMenu(false)
  }

  const handleLike = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setLikes(res.data.likes)
      if (onPostUpdate) {
        onPostUpdate(post._id, comments, res.data.likes)
      }
    } catch (err) {
      console.error('Ошибка лайка', err)
    }
  }

  const handleFollow = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/${post.user._id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (onFollowUpdate) {
        onFollowUpdate(post.user._id, res.data.isFollowing)
      }
    } catch (err) {
      console.error('Ошибка подписки', err)
    }
  }

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
      if (onPostUpdate)
        onPostUpdate(post._id, res.data.comments, res.data.likes)
      setComment('')
    } catch (err) {
      console.error('Ошибка комментария', err)
    }
  }

  const handleCommentLike = async (commentId) => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setComments(res.data.comments)
      if (onPostUpdate) {
        onPostUpdate(post._id, res.data.comments, likes)
      }
    } catch (err) {
      console.error('Ошибка лайка комментария', err)
    }
  }

  const formatCommentTime = (date) => {
    if (!date) return ''
    try {
      return formatDistanceToNowStrict(new Date(date), { addSuffix: false })
        .replace(' seconds', ' s.')
        .replace(' minutes', ' m.')
        .replace(' minute', ' m.')
        .replace(' hours', ' h.')
        .replace(' hour', ' h.')
        .replace(' days', ' d.')
        .replace(' day', ' d.')
    } catch (e) {
      return e
    }
  }

  const renderUserAvatar = (user, className) => {
    const hasAvatar =
      user?.avatar && user.avatar.trim() !== '' && user.avatar !== 'undefined'

    if (hasAvatar) {
      return <img src={user.avatar} alt="avatar" className={className} />
    }
    return <FaUserCircle className={`${className} placeholder-icon`} />
  }

  if (!post || !post.user) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="close-modal" onClick={onClose}>
        <FaTimes size={25} />
      </button>

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-image-container">
          <img src={post.image} alt="post" />
        </div>

        <div className="modal-info-container">
          <div className="modal-header">
            <div className="modal-header-left">
              {' '}
              <Link to={`/profile/${post.user._id}`}>
                {renderUserAvatar(post.user, 'modal-header-avatar')}
              </Link>
              <Link to={`/profile/${post.user._id}`} className="username-link">
                <strong>{post.user.username}</strong>
              </Link>
              {currentUserId !== post.user._id && (
                <>
                  <span>•</span>
                  <p
                    className={`followbtn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </p>
                </>
              )}
            </div>
            <div className="post-options-container">
              <FaEllipsisH
                className="post-options-icon"
                onClick={() => setShowMenu(true)}
              />
            </div>
          </div>

          <div className="modal-comments-list">
            {post.caption && (
              <div className="comment-item-container post-description">
                <div className="comment-main">
                  <Link to={`/profile/${post.user._id}`} onClick={onClose}>
                    {renderUserAvatar(post.user, 'comment-avatar')}
                  </Link>
                  <div className="comment-content">
                    <p>
                      <Link
                        to={`/profile/${post.user._id}`}
                        onClick={onClose}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <strong>{post.user.username}</strong>
                      </Link>
                      <span style={{ marginLeft: '8px' }}>{post.caption}</span>
                    </p>
                    <div className="comment-footer">
                      <span className="comment-time">
                        {formatCommentTime(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {comments.map((c) => (
              <div key={c._id} className="comment-item-container">
                <div className="comment-main">
                  <Link to={`/profile/${c.user?._id}`} onClick={onClose}>
                    {renderUserAvatar(c.user, 'comment-avatar')}
                  </Link>
                  <div className="comment-content">
                    <p>
                      <Link
                        to={`/profile/${c.user?._id}`}
                        onClick={onClose}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <strong>{c.user?.username || 'User'}</strong>
                      </Link>
                      <span style={{ marginLeft: '8px' }}>{c.text}</span>
                    </p>
                    <div className="comment-footer">
                      <span className="comment-time">
                        {formatCommentTime(c.createdAt)}
                      </span>
                      {c.likes?.length > 0 && (
                        <span className="comment-likes-count">
                          Likes: {c.likes.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="comment-like-icon"
                  onClick={() => handleCommentLike(c._id)}
                >
                  {c.likes?.includes(currentUserId) ? (
                    <FaHeart color="#ed4956" size={12} />
                  ) : (
                    <FaRegHeart size={12} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions-section">
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
            <div className="likes-count">
              <strong>{likes.length} likes</strong>
            </div>
            <div className="post-time-ago">
              {formatCommentTime(post.updatedAt || post.createdAt)}
            </div>
          </div>

          <div className="modal-comment-input">
            <div className="emoji-container" style={{ position: 'relative' }}>
              <button
                className="emoji-trigger"
                onClick={() => setShowEmoji(!showEmoji)}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                <img src={smile} alt="emoji" />
              </button>

              {showEmoji && (
                <div className="emoji-dropdown">
                  {emojis.map((e) => (
                    <span
                      key={e}
                      onClick={() => {
                        setComment((prev) => prev + e)
                        setShowEmoji(false)
                      }}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <button onClick={handleComment} disabled={!comment.trim()}>
              Post
            </button>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="action-menu-overlay" onClick={() => setShowMenu(false)}>
          <div
            className="action-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            {isOwnPost && (
              <>
                <button
                  className="menu-item delete-btn"
                  onClick={() => {
                    onDelete(post._id)
                    setShowMenu(false)
                  }}
                >
                  Delete
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    onEdit(post)
                    setShowMenu(false)
                  }}
                >
                  Edit
                </button>
              </>
            )}
            <button className="menu-item" onClick={() => setShowMenu(false)}>
              Go to post
            </button>
            <button className="menu-item" onClick={handleCopyLink}>
              Copy link
            </button>
            <button className="menu-item" onClick={() => setShowMenu(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostModal
