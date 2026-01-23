import React, { useState, useEffect } from 'react'
import axios from 'axios'

const CreatePost = () => {
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('Anonymous')

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token') // JWT токен после логина

  // 1️⃣ Получаем имя пользователя с сервера
  useEffect(() => {
    const fetchUserName = async () => {
      console.log('Fetching user name...', userId)
      if (!userId || !token) return
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('User response:', res.data)
        setUserName(res.data.username)
      } catch (err) {
        console.error('Error fetching user name', err)
      }
    }
    fetchUserName()
  }, [userId, token])

  // 2️⃣ Обработка выбора изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  // 3️⃣ Преобразование файла в Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })

  // 4️⃣ Отправка поста
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!caption) {
      alert('Caption is required')
      return
    }
    if (!image) {
      alert('Image is required')
      return
    }

    setLoading(true)
    try {
      const imageData = await fileToBase64(image)

      await axios.post(
        'http://localhost:5000/api/posts',
        {
          caption,
          image: imageData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      resetForm()
    } catch (err) {
      console.error(err)
      alert('Error creating post')
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCaption('')
    setImage(null)
    setPreview(null)
    setLoading(false)
    alert('Post created!')
  }

  return (
    <div style={styles.page}>
      {/* <NavBar /> */}
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2>Create Post</h2>
          <p style={{ fontWeight: 'bold' }}>{userName}</p>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={styles.textarea}
            />
            {preview && (
              <img src={preview} alt="Preview" style={styles.preview} />
            )}
            <div style={styles.controls}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
          <div style={styles.emoji}>
            <button onClick={() => setCaption((c) => c + '😊')}>😊</button>
            <button onClick={() => setCaption((c) => c + '❤️')}>❤️</button>
            <button onClick={() => setCaption((c) => c + '😂')}>😂</button>
            <button onClick={() => setCaption((c) => c + '👍')}>👍</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    width: '400px',
    maxWidth: '90%',
    textAlign: 'center',
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'none',
  },
  preview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    marginBottom: '10px',
    borderRadius: '5px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emoji: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
}

export default CreatePost
