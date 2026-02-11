import React, { useState, useEffect } from 'react'
import { $api } from '../api/api.js'
import './Explore.css'

const Explore = ({ onPostClick }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        const res = await $api.get('/posts')

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
          const pos = index % 10
          let gridClass = ''
          if (pos === 0 || pos === 7) {
            gridClass = 'tall'
          }

          return (
            <div
              key={post._id}
              className={`explore-item ${gridClass}`}
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
