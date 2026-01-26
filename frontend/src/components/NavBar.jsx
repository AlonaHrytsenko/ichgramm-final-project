import React from 'react'
import { Link } from 'react-router-dom'
import {
  FaHome,
  FaSearch,
  FaCompass,
  FaRegPaperPlane,
  FaRegHeart,
  FaPlusSquare,
  FaUserCircle,
} from 'react-icons/fa'
import './NavBar.css'

const NavBar = ({
  unreadCount,
  onNotificationsClick,
  onSearchClick,
  isSearchOpen,
  isNotifOpen,
  onCreateClick,
}) => {
  const userId = localStorage.getItem('userId')

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <Link to="/" className="logo-link">
          ICHGRAM
        </Link>
      </div>
      <nav className="nav-menu">
        <Link to="/" className="nav-item">
          <FaHome size={26} />
          <span>Home</span>
        </Link>

        {/* Кнопка Поиска */}
        <div
          className={`nav-item ${isSearchOpen ? 'active' : ''}`}
          onClick={onSearchClick}
        >
          <FaSearch size={26} />
          <span>Search</span>
        </div>

        <Link to="/explore" className="nav-item">
          <FaCompass size={26} />
          <span>Explore</span>
        </Link>

        <Link to="/messages" className="nav-item">
          <FaRegPaperPlane size={26} />
          <span>Message</span>
        </Link>

        {/* Кнопка Уведомлений */}
        <div
          className={`nav-item ${isNotifOpen ? 'active' : ''}`}
          onClick={onNotificationsClick}
        >
          <div className="icon-wrapper">
            <FaRegHeart size={26} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </div>
          <span>Notifications</span>
        </div>

        <div
          className="nav-item"
          onClick={onCreateClick}
          style={{ cursor: 'pointer' }}
        >
          <FaPlusSquare size={26} />
          <span>Create</span>
        </div>

        <Link to={`/profile/${userId}`} className="nav-item">
          <FaUserCircle size={26} />
          <span>Profile</span>
        </Link>
      </nav>
    </aside>
  )
}

export default NavBar
