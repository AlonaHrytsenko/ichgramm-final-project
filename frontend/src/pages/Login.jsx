import React, { useState } from 'react'
import { $api } from '../api/api.js'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'
import picture from '../assets/Background.jpg'
import logo from '../assets/ICHGRAM.jpg'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    console.log('Sending data:', {
      email: email.trim(),
      password: password.trim(),
    })
    try {
      const res = await $api.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.user._id)
      navigate('/')
    } catch (err) {
      console.error('Ошибка входа:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Ошибка входа')
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-content">
        <div className="auth-visuals">
          <img src={picture} alt="Phones preview" className="phones-img" />
        </div>

        <div className="auth-form-column">
          <div className="auth-card main-card">
            <img src={logo} alt="Logo" />

            <form onSubmit={handleSubmit} className="login-inner-form">
              {error && <p className="auth-error">{error}</p>}

              <input
                type="email"
                placeholder="Username, or email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="auth-submit-btn">
                Log in
              </button>

              <div className="auth-divider">
                <div className="line"></div>
                <div className="text">OR</div>
                <div className="line"></div>
              </div>

              <Link
                to="/forgot-password"
                title="Trouble logging in?"
                className="forgot-password"
              >
                Forgot password?
              </Link>
            </form>
          </div>

          <div className="auth-card signup-card">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
