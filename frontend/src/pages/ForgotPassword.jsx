import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'
import icon from '../assets/Trouble-logging.jpg'
const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleReset = (e) => {
    e.preventDefault()
    // Здесь  логика отправки письма на бэкенд
    setMessage(`Link sent to ${email}`)
  }

  return (
    <div className="auth-page-container">
      <div className="auth-form-column">
        <div className="auth-card main-card reset-card">
          <img src={icon} alt="Trouble icon" />
          <h2 className="reset-title">Trouble logging in?</h2>
          <p className="reset-text">
            Enter your email, phone, or username and we'll send you a link to
            get back into your account.
          </p>

          <form onSubmit={handleReset} className="login-inner-form">
            <input
              type="text"
              placeholder="Email or Username"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="auth-submit-btn">
              Reset your password
            </button>

            <div className="auth-divider">
              <div className="line"></div>
              <div className="text">OR</div>
              <div className="line"></div>
            </div>

            <Link to="/register" className="create-account-link">
              Create new account
            </Link>
          </form>

          {message && <p className="success-msg">{message}</p>}
        </div>

        <div className="auth-card back-to-login">
          <Link to="/login" className="back-link">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
