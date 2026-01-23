import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Explore.css'

const Explore = ({ onPostClick }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts')
        // Перемешиваем посты для эффекта случайности
        const shuffled = [...res.data].sort(() => 0.5 - Math.random())
        setPosts(shuffled)
      } catch (err) {
        console.error('Error loading explore:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchExplorePosts()
  }, [])

  if (loading) return <div className="loader">Loading...</div>

  return (
    <div className="explore-container">
      <div className="explore-grid">
        {posts.map((post, index) => {
          // Определяем визуальный размер ячейки для создания структуры как на фото
          let gridClass = ''
          if (index % 10 === 0)
            gridClass = 'tall' // Высокая
          else if (index % 12 === 5) gridClass = 'wide' // Широкая (опционально)

          return (
            <div
              key={post._id}
              className={`explore-item ${gridClass}`}
              // ПРИ КЛИКЕ: передаем весь объект поста в App.jsx
              onClick={() => onPostClick(post)}
            >
              <img src={post.image} alt="Explore post" loading="lazy" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Explore
