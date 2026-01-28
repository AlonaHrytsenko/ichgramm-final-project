import React from 'react'
import Post from '../components/Post'
import './Feed.css'
import endPicture from '../assets/end-icon.jpg'

const Feed = ({ posts, onPostClick, onPostUpdate, onFollowUpdate }) => {
  const currentUserId = localStorage.getItem('userId')

  return (
    <div className="feed-container">
      <div className="feed-page">
        <main className="feed-grid">
          {posts && posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  onPostClick={() => onPostClick(post)}
                  onPostUpdate={onPostUpdate}
                  onFollowUpdate={onFollowUpdate}
                />
              ))}

              <div className="feed-end-message">
                <img src={endPicture} alt="Checkmark" className="end-icon" />
                <p className="end-title">You've seen all the updates</p>
                <p className="end-subtitle">
                  You have viewed all new publications
                </p>
              </div>
            </>
          ) : (
            <p className="empty-msg">No posts yet.</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default Feed
