import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './CreatePost.css'
import uploadIcon from '../assets/upload-icon.svg'
import smile from '../assets/smile.svg'

const CreatePost = ({ onClose }) => {
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('Anonymous')
  const [userAvatar, setUserAvatar] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)

  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !token) return
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setUserName(res.data.username)

        const avatarUrl = res.data.avatar
        if (
          avatarUrl &&
          !avatarUrl.startsWith('http') &&
          !avatarUrl.startsWith('data:')
        ) {
          setUserAvatar(`http://localhost:5000/${avatarUrl}`)
        } else {
          setUserAvatar(avatarUrl)
        }
      } catch (err) {
        console.error('Error fetching user data', err)
      }
    }
    fetchUserData()
  }, [userId, token])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })

  const handleSubmit = async () => {
    if (!caption || !image) {
      alert('Please add a caption and an image')
      return
    }
    setLoading(true)
    try {
      const imageData = await fileToBase64(image)
      await axios.post(
        'http://localhost:5000/api/posts',
        { caption, image: imageData },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      alert('Post shared!')
      onClose()
    } catch (err) {
      alert('Error creating post', err)
      setLoading(false)
    }
  }

  const emojis = ['😊', '❤️', '😂', '👍', '🔥', '✨', '🙌', '😎']

  return (
    <div className="create-post-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            ✕
          </button>
          <h3>Create new post</h3>
          <button
            className="share-btn"
            onClick={handleSubmit}
            disabled={loading || !image}
          >
            {loading ? 'Posting...' : 'Share'}
          </button>
        </div>

        <div className="modal-body">
          <div
            className="image-upload-section"
            onClick={() => fileInputRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="post-preview-img" />
            ) : (
              <div className="upload-placeholder">
                <img src={uploadIcon} alt="upload-icon" />
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Правая часть: Данные поста */}
          <div className="post-details-section">
            <div
              className="user-info-row"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              <div className="mini-avatar">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="real-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : null}

                {!userAvatar && (
                  <div className="placeholder-avatar">
                    {userName ? userName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <span className="username-link">{userName}</span>
            </div>

            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength="200"
            />

            <div className="post-footer">
              <div className="emoji-container">
                <button
                  className="emoji-trigger"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  <img src={smile} alt="emoji" />
                </button>
                {showEmoji && (
                  <div className="emoji-dropdown">
                    {emojis.map((e) => (
                      <span
                        key={e}
                        onClick={() => {
                          setCaption((c) => c + e)
                          setShowEmoji(false)
                        }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="char-count">{caption.length}/200</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
