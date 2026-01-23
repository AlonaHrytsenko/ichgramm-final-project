import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import './Search.css'

const Search = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  // Закрываем поиск при переходе на другую страницу
  useEffect(() => {
    if (isOpen) onClose()
  }, [location.pathname])

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      setUsers([])
      return
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/users?search=${value}`
      )
      setUsers(res.data)
    } catch (err) {
      console.error('Search error', err)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Затемнение фона */}
      <div className="search-overlay" onClick={onClose}></div>

      {/* Боковая панель поиска */}
      <div className="search-drawer">
        <div className="search-header">
          <h2 className="search-title">Search</h2>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={handleSearch}
              className="search-input"
              autoFocus
            />
            {query && (
              <button
                className="clear-btn"
                onClick={() => {
                  setQuery('')
                  setUsers([])
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="search-results">
          {users.length === 0 && query.trim() !== '' ? (
            <p className="no-results">No results found.</p>
          ) : query.trim() === '' ? (
            <div className="recent-section">
              <span className="recent-label">Recent</span>
              <p className="no-recent">No recent searches.</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="search-user-item"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <img
                  src={user.avatar || 'https://via.placeholder.com/44'}
                  alt="avatar"
                  className="search-avatar"
                />
                <div className="search-user-info">
                  <span className="search-username">{user.username}</span>
                  <span className="search-fullname">
                    {user.fullName || 'User'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default Search
