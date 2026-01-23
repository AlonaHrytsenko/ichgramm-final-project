import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './Profile.css'

const Profile = ({ onPostClick, onPostUpdate }) => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatar: '',
    website: '',
  })
  const [isFollowing, setIsFollowing] = useState(false)

  const currentUserId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, postsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/profile/${id}`),
          axios.get(`http://localhost:5000/api/posts?user=${id}`),
        ])

        setProfile(profRes.data)
        setPosts(postsRes.data)
        setEditData({
          username: profRes.data.username || '',
          fullName: profRes.data.fullName || '',
          bio: profRes.data.bio || '',
          avatar: profRes.data.avatar || '',
          website: profRes.data.website || '',
        })

        if (currentUserId && profRes.data.followers.includes(currentUserId)) {
          setIsFollowing(true)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [id, currentUserId])

  // --- ЛОГИКА ОБНОВЛЕНИЯ ДАННЫХ ИЗВНЕ ---
  // Этот эффект следит за изменениями в App.jsx и обновляет локальный список постов профиля
  useEffect(() => {
    if (onPostUpdate) {
      // Мы можем использовать глобальную функцию обновления здесь
    }
  }, [onPostUpdate])

  const handleSave = async () => {
    if (!token) return alert('You are not logged in')
    try {
      const res = await axios.put(
        'http://localhost:5000/api/profile',
        editData,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setProfile(res.data)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message)
      } else {
        console.error('Update error', err)
      }
    }
  }

  const handleFollow = async () => {
    if (!token) return alert('Please log in to follow')
    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setProfile((prev) => ({
        ...prev,
        followers: res.data.isFollowing
          ? [...prev.followers, currentUserId]
          : prev.followers.filter((fId) => fId !== currentUserId),
      }))
      setIsFollowing(res.data.isFollowing)
    } catch (err) {
      console.error('Follow error:', err)
    }
  }

  if (!profile) return <div className="loader">Loading...</div>

  // Если открыто редактирование
  if (isEditing) {
    return (
      <div className="edit-profile-container">
        <h1>Edit profile</h1>
        <div className="edit-avatar-section">
          <img
            src={editData.avatar || 'https://via.placeholder.com/150'}
            alt="avatar"
          />
          <div className="edit-avatar-info">
            <span className="edit-username">{profile.username}</span>
            <input
              type="file"
              id="file"
              onChange={(e) => {
                const reader = new FileReader()
                reader.onloadend = () =>
                  setEditData({ ...editData, avatar: reader.result })
                reader.readAsDataURL(e.target.files[0])
              }}
              style={{ display: 'none' }}
            />
            <label htmlFor="file" className="change-photo-btn">
              New photo
            </label>
          </div>
        </div>

        <div className="edit-fields">
          <label>Username</label>
          <input
            type="text"
            value={editData.username}
            onChange={(e) =>
              setEditData({
                ...editData,
                username: e.target.value.toLowerCase().replace(/\s/g, ''),
              })
            }
          />
          <label>Full Name</label>
          <input
            type="text"
            value={editData.fullName}
            onChange={(e) =>
              setEditData({ ...editData, fullName: e.target.value })
            }
          />
          <label>Website</label>
          <input
            type="text"
            value={editData.website}
            onChange={(e) =>
              setEditData({ ...editData, website: e.target.value })
            }
          />
          <label>About</label>
          <textarea
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            maxLength="150"
          />
          <span className="char-count">{editData.bio.length} / 150</span>
        </div>
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-btn" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="avatar-wrapper">
          <img
            className="profile-avatar"
            src={profile.avatar || 'https://via.placeholder.com/150'}
            alt="avatar"
          />
        </div>

        <section className="profile-info">
          <div className="info-top">
            <h2 className="username-title">{profile.username}</h2>
            {id === currentUserId ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <div className="action-btns">
                <button
                  className={`follow-btn ${isFollowing ? 'unfollow' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="message-btn">Message</button>
              </div>
            )}
          </div>

          <ul className="stats-list">
            <li>
              <strong>{posts.length}</strong> posts
            </li>
            <li>
              <strong>{profile.followers.length}</strong> followers
            </li>
            <li>
              <strong>{profile.following.length}</strong> following
            </li>
          </ul>

          <div className="bio-section">
            <h4 className="full-name">{profile.fullName}</h4>
            <p className="bio-text">{profile.bio}</p>
            {profile.website && (
              <a
                href={profile.website}
                className="website-link"
                target="_blank"
                rel="noreferrer"
              >
                {profile.website}
              </a>
            )}
          </div>
        </section>
      </header>

      <div className="profile-posts-grid">
        {posts.map((post) => (
          <div key={post._id} className="grid-item">
            <img
              src={post.image}
              alt="post"
              onClick={() => onPostClick(post)} // ПЕРЕДАЕМ В APP.JSX
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile
