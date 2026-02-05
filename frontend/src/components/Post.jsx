import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa'
import { formatDistanceToNowStrict } from 'date-fns'
import { FaUserCircle } from 'react-icons/fa'
import './Post.css'

const Post = ({
  post,
  currentUserId,
  onPostClick,
  onPostUpdate,
  onFollowUpdate,
}) => {
  const [likes, setLikes] = useState(post.likes || [])
  const [comments, setComments] = useState(post?.comments || [])
  const [isFollowing, setIsFollowing] = useState(
    post.user.followers?.some(
      (id) => id.toString() === currentUserId?.toString(),
    ),
  )
  const isLiked = likes.includes(currentUserId)
  useEffect(() => {
    setLikes(post.likes || [])
    setComments(post?.comments || [])
  }, [post.likes, post.comments])

  useEffect(() => {
    const followed = post.user.followers?.some(
      (id) => id.toString() === currentUserId?.toString(),
    )
    setIsFollowing(followed)
  }, [post.user.followers, currentUserId])

  const handleLike = async (e) => {
    e.stopPropagation()
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const newLikes = res.data.likes
      setLikes(newLikes)
      if (onPostUpdate) {
        onPostUpdate(post._id, post.comments, newLikes)
      }
    } catch (err) {
      console.error('Ошибка лайка', err)
    }
  }

  const handleFollow = async (e) => {
    e.stopPropagation()
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/${post.user._id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setIsFollowing(res.data.isFollowing)
      if (onFollowUpdate) {
        onFollowUpdate(post.user._id, res.data.isFollowing)
      }
    } catch (err) {
      console.error('Ошибка подписки', err)
    }
  }

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
  const renderTruncatedText = (text, maxLength = 40) => {
    if (text.length <= maxLength) return text

    return (
      <>
        {text.substring(0, maxLength)}
        <span
          className="more-link"
          onClick={(e) => {
            e.stopPropagation()
            onPostClick(post)
          }}
          style={{ cursor: 'pointer', color: '#8e8e8e', marginLeft: '4px' }}
        >
          ...more
        </span>
      </>
    )
  }

  return (
    <div className="instagram-post">
      <div className="post-header">
        <div className="header-left">
          <Link to={`/profile/${post.user._id}`} className="post-avatar-link">
            {post.user?.avatar &&
            post.user.avatar.trim() !== '' &&
            post.user.avatar !== 'undefined' ? (
              <img
                src={post.user.avatar}
                className="avatar"
                alt={post.user.username}
              />
            ) : (
              <FaUserCircle className="avatar placeholder-icon" />
            )}
          </Link>
          <div className="userinfo">
            <Link to={`/profile/${post.user._id}`} className="username-link">
              <span className="username">{post.user.username}</span>
            </Link>
            <span className="post-time">• {timeAgo}</span>
          </div>
        </div>

        {currentUserId !== post.user._id && (
          <button
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="post-image-wrapper" onClick={() => onPostClick(post)}>
        <img src={post.image} className="postImage" alt="post" />
      </div>

      <div className="post-content">
        <div>
          <div className="post-actions">
            <div onClick={handleLike} className="action-icon">
              {isLiked ? (
                <FaHeart color="#ed4956" size={24} />
              ) : (
                <FaRegHeart size={24} />
              )}
            </div>
            <FaRegComment
              size={24}
              className="action-icon"
              onClick={() => onPostClick(post)}
            />
          </div>

          <div className="likes-count">
            <strong>{likes.length} likes</strong>
          </div>

          <div className="caption">
            <span className="username">{post.user.username}</span>
            <span
              className="caption-text"
              dangerouslySetInnerHTML={{ __html: post.caption }}
            ></span>
            {post.caption?.length > 100 && (
              <span className="more-link" onClick={() => onPostClick(post)}>
                {' '}
                ...more
              </span>
            )}
          </div>

          <div className="mini-comments">
            {post.comments?.slice(-2).map((c, index) => (
              <div key={index} className="comment-item">
                <strong>{c.user?.username}</strong>{' '}
                {renderTruncatedText(c.text, 40)}
              </div>
            ))}
          </div>
        </div>

        {post.comments?.length > 0 && (
          <div className="view-all" onClick={() => onPostClick(post)}>
            View all comments ({post.comments.length})
          </div>
        )}
      </div>
    </div>
  )
}

export default Post
