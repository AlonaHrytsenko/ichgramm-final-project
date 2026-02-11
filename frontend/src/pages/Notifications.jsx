import React, { useEffect, useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { useLocation, Link } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { $api } from '../api/api.js'
import './Notifications.css'

const Notifications = ({ isOpen, onClose, onPostClick }) => {
  const [notifications, setNotifications] = useState([])
  const location = useLocation()
  const hasAvatar = (user) =>
    user?.avatar && user.avatar.trim() !== '' && user.avatar !== 'undefined'
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [location.pathname])

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await $api.get('/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          })
          setNotifications(res.data)
        } catch (err) {
          console.error('Ошибка загрузки уведомлений', err)
        }
      }
      fetchNotifications()
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatTime = (date) => {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: false })
      .replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' months', 'mo')
      .replace(' month', 'mo')
  }

  return (
    <>
      <div className="notifications-overlay" onClick={onClose}></div>
      <div className="notifications-drawer">
        <h2 className="drawer-title">Notifications</h2>
        <div className="section-label">New</div>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="empty-msg">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className="notification-item">
                <Link
                  to={`/profile/${n.fromUser?._id}`}
                  onClick={onClose}
                  className="notif-avatar-link"
                >
                  {hasAvatar(n.fromUser) ? (
                    <img
                      src={n.fromUser.avatar}
                      className="notif-avatar"
                      alt=""
                    />
                  ) : (
                    <FaUserCircle className="notif-avatar placeholder" />
                  )}
                </Link>

                <div className="notif-content">
                  <Link
                    to={`/profile/${n.fromUser?._id}`}
                    className="notif-username-link"
                    onClick={onClose}
                  >
                    <strong>{n.fromUser?.username}</strong>
                  </Link>

                  {n.type === 'like' && ' liked your photo.'}
                  {n.type === 'comment' && ' commented on your photo.'}
                  {n.type === 'follow' && ' started following you.'}

                  <span className="notif-time"> {formatTime(n.createdAt)}</span>
                </div>

                {n.post && (
                  <img
                    src={n.post.image}
                    className="notif-post-img"
                    alt="post prew"
                    onClick={() => onPostClick(n.post)}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default Notifications
