import React, { useState, useEffect } from 'react'
import { $api } from '../api/api.js'
import './Explore.css'

const Explore = ({ onPostClick, currentUserId }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExplorePosts = async () => {
      if (!currentUserId) return
      try {
        setLoading(true)
        const res = await $api.get(
          `/posts?currentUserId=${currentUserId}&discovery=true`,
        )
        const shuffled = [...res.data].sort(() => 0.5 - Math.random())
        setPosts(shuffled)
      } catch (err) {
        console.error('Error loading explore:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchExplorePosts()
  }, [currentUserId])

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
