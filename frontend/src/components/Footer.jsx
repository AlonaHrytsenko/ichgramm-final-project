import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = ({ onSearchClick, onNotifClick, onCreateClick, onLogout }) => {
  return (
    <footer className="footer">
      <nav className="footer-nav">
        <Link to="/" className="footer-link">
          Home
        </Link>

        <span className="footer-link" onClick={onSearchClick}>
          Search
        </span>

        <Link to="/explore" className="footer-link">
          Explore
        </Link>
        <Link to="/messages" className="footer-link">
          Messages
        </Link>

        <span className="footer-link" onClick={onNotifClick}>
          Notifications
        </span>

        <span className="footer-link" onClick={onCreateClick}>
          Create
        </span>
        <span className="footer-link" onClick={onLogout}>
          Logout
        </span>
      </nav>

      <div className="footer-copy">© 2026 ICHgram</div>
    </footer>
  )
}

export default Footer
