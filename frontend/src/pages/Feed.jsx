import React from 'react'
import Post from '../components/Post'
import './Feed.css'

const Feed = ({ posts, onPostClick, onPostUpdate, onFollowUpdate }) => {
  const currentUserId = localStorage.getItem('userId')

  return (
    <div className="feed-container">
      <div className="feed-page">
        <main className="feed-grid">
          {/* Проверяем, есть ли посты, чтобы не было ошибки при пустом массиве */}
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Post
                key={post._id} // Ключ лучше здесь
                post={post}
                currentUserId={currentUserId}
                onPostClick={() => onPostClick(post)}
                onPostUpdate={onPostUpdate}
                onFollowUpdate={onFollowUpdate}
              />
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
