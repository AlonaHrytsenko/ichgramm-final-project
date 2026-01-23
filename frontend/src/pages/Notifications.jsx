import React, { useEffect, useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { useLocation, Link } from 'react-router-dom' // Добавили Link
import axios from 'axios'
import './Notifications.css'

const Notifications = ({ isOpen, onClose, onPostClick }) => {
  const [notifications, setNotifications] = useState([])
  const location = useLocation()

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
          const res = await axios.get(
            'http://localhost:5000/api/notifications',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          setNotifications(res.data)
        } catch (err) {
          console.error('Ошибка загрузки уведомлений', err)
        }
      }
      fetchNotifications()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Вспомогательная функция для сокращения времени (как в Instagram)
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
                {/* Ссылка на аватар */}
                <Link to={`/profile/${n.fromUser?._id}`} onClick={onClose}>
                  <img
                    src={n.fromUser?.avatar || 'https://via.placeholder.com/44'}
                    className="notif-avatar"
                    alt=""
                  />
                </Link>

                <div className="notif-content">
                  <Link
                    to={`/profile/${n.fromUser?._id}`}
                    className="notif-username-link"
                    onClick={onClose}
                  >
                    <strong>{n.fromUser?.username}</strong>
                  </Link>

                  {/* Логика текстов уведомлений */}
                  {n.type === 'like' && ' liked your photo.'}
                  {n.type === 'comment' && ' commented on your photo.'}
                  {n.type === 'follow' && ' started following you.'}

                  <span className="notif-time"> {formatTime(n.createdAt)}</span>
                </div>

                {/* Если есть пост, показываем миниатюру поста */}
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
