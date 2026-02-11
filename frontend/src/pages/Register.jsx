import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'
import logo from '../assets/ICHGRAM.jpg'
import { $api } from '../api/api.js'
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (formData.password.length < 6) {
      setErrors({ password: 'Password is too short (min 6 characters).' })
      return
    }
    try {
      await $api.post('/auth/register', formData)
      alert('Регистрация успешна! Войдите в систему.')
      navigate('/login')
    } catch (err) {
      const serverMsg = err.response?.data?.message || ''

      if (serverMsg.toLowerCase().includes('email')) {
        setErrors({ email: serverMsg })
      } else if (serverMsg.toLowerCase().includes('username')) {
        setErrors({ username: serverMsg })
      } else {
        setErrors({ common: serverMsg || 'Registration error' })
      }
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-form-column">
        <div className="auth-card main-card">
          <img src={logo} alt="Logo" />
          <p className="signup-subtitle">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="login-inner-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="field-error-msg">{errors.email}</p>}
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="auth-input"
              value={formData.fullName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`auth-input ${errors.username ? 'input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              required
            />

            {errors.username && (
              <p className="field-error-msg">{errors.username}</p>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <p className="field-error-msg">{errors.password}</p>
            )}
            {errors.common && (
              <p className="field-error-msg" style={{ textAlign: 'center' }}>
                {errors.common}
              </p>
            )}

            <p className="auth-policy-text">
              People who use our service may have uploaded your contact
              information to Instagram. <a href="#">Learn More</a>
            </p>
            <p className="auth-policy-text">
              By signing up, you agree to our <a href="#">Terms</a>,{' '}
              <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a>.
            </p>

            <button type="submit" className="auth-submit-btn">
              Sign up
            </button>
          </form>
        </div>

        <div className="auth-card signup-card">
          <p>
            Have an account?{' '}
            <Link to="/login" className="signup-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
