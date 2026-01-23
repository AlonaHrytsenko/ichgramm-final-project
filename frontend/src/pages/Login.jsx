import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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
      const res = await axios.post('http://localhost:5000/api/auth/login', {
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
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ddd',
      }}
    >
      <h2>Войти</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: '100%', padding: '10px', margin: '10px 0' }}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: '100%', padding: '10px', margin: '10px 0' }}
      />
      <button type="submit" style={{ width: '100%', padding: '10px' }}>
        Войти
      </button>
    </form>
  )
}

export default Login
