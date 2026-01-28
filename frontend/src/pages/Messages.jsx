import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Chat from '../components/Chat.jsx'
import './Messages.css'
import { useParams } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import { FiEdit } from 'react-icons/fi'

const Messages = ({ socket, currentUser }) => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [users, setUsers] = useState([]) // Список всех пользователей для выбора
  const currentUserId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')
  const { userId } = useParams()

  // Загрузка чатов и пользователей
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/chats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setChats(chatsRes.data)
        setUsers(usersRes.data.filter((u) => u._id !== currentUserId)) // Исключаем себя
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
      }
    }
    fetchData()
  }, [token, currentUserId])

  // Функция создания или открытия существующего чата
  const startChat = async (recipientId) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/chats',
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const newChat = res.data

      // Обновляем список чатов, только если такого чата еще нет в списке
      setChats((prevChats) => {
        if (!prevChats.find((c) => c._id === newChat._id)) {
          return [newChat, ...prevChats]
        }
        return prevChats
      })

      setSelectedChat(newChat)
      setIsNewChatOpen(false)
    } catch (err) {
      console.error('Ошибка создания чата:', err)
    }
  }

  useEffect(() => {
    if (userId && chats.length > 0) {
      const existingChat = chats.find((chat) =>
        chat.participants.some((p) => p._id === userId),
      )

      if (existingChat) {
        setSelectedChat(existingChat)
      } else {
        startChat(userId)
      }
    }
  }, [userId, chats])

  return (
    <div className="messages-page-container">
      <div className="chats-sidebar">
        <div className="sidebar-header">
          <span className="current-user-name">
            {currentUser?.username || localStorage.getItem('username')}
          </span>
          {/* Кнопка "Новый чат" */}
          <button
            className="new-chat-btn"
            onClick={() => setIsNewChatOpen(true)}
          >
            <FiEdit size={22} />
          </button>
        </div>

        <div className="chats-list">
          {chats.map((chat) => {
            const recipient = chat.participants.find(
              (p) => p._id !== currentUserId,
            )
            const lastMsg = chat.lastMessage
            const senderName =
              lastMsg?.sender === currentUserId ? 'You' : recipient?.username
            return (
              <div
                key={chat._id}
                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                <img
                  src={recipient?.avatar || '/default-avatar.png'}
                  alt="avatar"
                />
                <div className="chat-item-info">
                  <span className="chat-item-name">{recipient?.username}</span>
                  <div className="chat-item-last">
                    <span className="chat-item-last-msg">
                      {lastMsg
                        ? `${senderName} sent a message`
                        : 'No messages yet'}
                    </span>
                    {lastMsg?.createdAt && (
                      <span className="chat-item-time">
                        ·
                        {formatDistanceToNowStrict(new Date(lastMsg.createdAt))
                          .replace(' minutes', 'm')
                          .replace(' minute', 'm')
                          .replace(' hours', 'h')
                          .replace(' hour', 'h')
                          .replace(' days', 'd')
                          .replace(' day', 'd')
                          .replace(' weeks', 'w')
                          .replace(' week', 'w')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="chat-main-area">
        {selectedChat ? (
          <Chat
            chat={selectedChat}
            currentUserId={currentUserId}
            socket={socket}
          />
        ) : (
          <div className="empty-chat-placeholder">
            {/* ... код заглушки из предыдущего ответа ... */}
          </div>
        )}
      </div>

      {/* Модалка выбора пользователя */}
      {isNewChatOpen && (
        <div className="new-chat-modal-overlay">
          <div className="new-chat-modal">
            <div className="modal-header">
              <button onClick={() => setIsNewChatOpen(false)}>Close</button>
              <h3>New Message</h3>
              <button className="next-btn" disabled>
                Next
              </button>
            </div>
            <div className="user-search-list">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="user-select-item"
                  onClick={() => startChat(user._id)}
                >
                  <img src={user.avatar} alt="" />
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    <span className="fullname">{user.fullName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
