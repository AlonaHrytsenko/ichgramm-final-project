import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { $api } from '../api/api.js'
import './Profile.css'

const Profile = ({ posts, onPostClick, onFollowUpdate }) => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatar: '',
    website: '',
  })

  const navigate = useNavigate()
  const currentUserId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')
  const authorDataInPosts = posts.find(
    (p) => (p.user._id || p.user) === id,
  )?.user
  const currentFollowers =
    authorDataInPosts?.followers || profile?.followers || []
  const isFollowing = currentFollowers.includes(currentUserId)
  const userPosts = posts.filter((post) => {
    const postUserId = post.user._id || post.user
    return postUserId?.toString() === id?.toString()
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await $api.get(`/profile/${id}`)
        setProfile(res.data)
        setEditData({
          username: res.data.username || '',
          fullName: res.data.fullName || '',
          bio: res.data.bio || '',
          avatar: res.data.avatar || '',
          website: res.data.website || '',
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }
    fetchProfileData()
  }, [id, currentUserId])

  const handleSave = async () => {
    if (!token) return alert('You are not logged in')
    try {
      const res = await $api.put('/profile', editData, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
      const res = await $api.post(
        `/users/${id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setProfile((prev) => ({
        ...prev,
        followers: res.data.isFollowing
          ? [...(prev.followers || []), currentUserId]
          : (prev.followers || []).filter((fId) => fId !== currentUserId),
      }))

      if (onFollowUpdate) {
        onFollowUpdate(id, res.data.isFollowing)
      }
    } catch (err) {
      console.error('Follow error:', err)
    }
  }
  const hasAvatar = (avatarPath) => {
    return (
      avatarPath &&
      avatarPath.trim() !== '' &&
      avatarPath !== 'undefined' &&
      !avatarPath.includes('placeholder')
    )
  }
  if (!profile) return <div className="loader">Loading...</div>

  if (isEditing) {
    return (
      <div className="edit-profile-container">
        <h2>Edit profile</h2>
        <div className="edit-avatar-section">
          <div className="edit-avatar-info">
            {hasAvatar(editData.avatar) ? (
              <img src={editData.avatar} className="edit-avatar" alt="avatar" />
            ) : (
              <FaUserCircle className="edit-avatar placeholder" />
            )}
            <span className="edit-username">{profile.username}</span>
          </div>
          <div>
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
            <button className="change-photo-btn">
              <label htmlFor="file">New photo</label>
            </button>
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
        <div className="buttons">
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
          <button className="cancel-btn" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="avatar-wrapper">
          {hasAvatar(profile.avatar) ? (
            <img className="profile-avatar" src={profile.avatar} alt="avatar" />
          ) : (
            <FaUserCircle className="profile-avatar placeholder" />
          )}
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
                  className={`followBtn ${isFollowing ? 'unfollow' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  className="message-btn"
                  onClick={() => navigate(`/messages/${id}`)}
                >
                  Message
                </button>
              </div>
            )}
          </div>

          <ul className="stats-list">
            <li>
              <strong>{userPosts.length}</strong> posts
            </li>
            <li>
              <strong>{profile.followers?.length || 0}</strong> followers
            </li>
            <li>
              <strong>{profile.following?.length || 0}</strong> following
            </li>
          </ul>

          <div className="bio-section">
            <p className="full-name">{profile.fullName}</p>
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
        {userPosts.map((post) => (
          <div key={post._id} className="grid-item">
            <img
              src={post.image}
              alt="post"
              onClick={() => onPostClick(post)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile
