import React, { useState, useEffect } from 'react'
import { $api } from '../api/api.js'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import './Search.css'
import button from '../assets/Button.svg'

const Search = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isOpen) onClose()
  }, [location.pathname])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 3) {
        setUsers([])
        return
      }
      try {
        const res = await $api.get(`/users?search=${query}`)
        setUsers(res.data)
      } catch (err) {
        console.error('Search error', err)
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = (e) => {
    setQuery(e.target.value)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="search-overlay" onClick={onClose}></div>

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
                <img src={button} alt="close button" />
              </button>
            )}
          </div>
        </div>

        <div className="search-results">
          <p className="recent-label">Recent</p>
          {users.length === 0 && query.trim() !== '' ? (
            <p className="no-results">No results found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="search-user-item"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <div className="search-avatar-wrapper">
                  {user.avatar &&
                  user.avatar !== '' &&
                  user.avatar !== 'undefined' ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="search-avatar"
                    />
                  ) : (
                    <FaUserCircle className="search-avatar" />
                  )}
                </div>
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
