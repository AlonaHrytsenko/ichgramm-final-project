import React from 'react'
import Post from '../components/Post'
import './Feed.css'

// Теперь Feed только принимает данные (posts) и действие (onPostClick)
const Feed = ({ posts, onPostClick }) => {
  const currentUserId = localStorage.getItem('userId')

  return (
    <div className="feed-container">
      <div className="feed-page">
        <main className="feed-grid">
          {/* Проверяем, есть ли посты, чтобы не было ошибки при пустом массиве */}
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id}>
                <Post
                  post={post}
                  currentUserId={currentUserId}
                  isPreview={true}
                  onImageClick={() => onPostClick(post)}
                />
              </div>
            ))
          ) : (
            <p className="empty-msg">No posts yet.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default Feed
