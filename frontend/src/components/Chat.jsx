import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import '../pages/Messages.css'

const Chat = ({ chat, currentUserId, socket }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const token = localStorage.getItem('token')

  const recipient = chat.participants.find((p) => p._id !== currentUserId)
  const currentUser = chat.participants.find((p) => p._id === currentUserId)

  const renderAvatar = (user, className) => {
    const hasAvatar =
      user?.avatar && user.avatar.trim() !== '' && user.avatar !== 'undefined'

    if (hasAvatar) {
      return (
        <img
          src={user.avatar}
          alt="avatar"
          className={className}
          onClick={() => navigate(`/profile/${user._id}`)}
        />
      )
    }
    return (
      <FaUserCircle
        className={`${className} placeholder-icon`}
        onClick={() => navigate(`/profile/${user._id}`)}
      />
    )
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${chat._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        setMessages(res.data)
      } catch (err) {
        console.error('Ошибка при загрузке сообщений:', err)
      }
    }

    if (chat._id) {
      fetchMessages()
      socket.emit('join_chat', chat._id)
    }

    socket.on('receiveMessage', (message) => {
      if (message.chatId === chat._id) {
        setMessages((prev) => [...prev, message])
      }
    })

    return () => {
      socket.off('receiveMessage')
    }
  }, [chat._id, socket, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && newMessage.trim()) {
      const messageData = {
        chatId: chat._id,
        to: recipient._id,
        message: newMessage,
        senderId: currentUserId,
      }
      socket.emit('sendMessage', messageData)
      setNewMessage('')
    }
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        {renderAvatar(recipient, 'header-avatar')}
        <span className="header-username">{recipient?.username}</span>
      </div>

      <div className="messages-display">
        <div className="chat-user-info-center">
          {renderAvatar(recipient, 'center-info-avatar')}
          <h3>{recipient?.username}</h3>
          <p>{recipient?.fullName} · ICHgram</p>
          <button
            className="view-profile-btn"
            onClick={() => navigate(`/profile/${recipient._id}`)}
          >
            View profile
          </button>
        </div>

        <div className="chat-window">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-bubble-wrapper ${msg.senderId === currentUserId ? 'own' : 'other'}`}
            >
              {msg.senderId !== currentUserId &&
                renderAvatar(recipient, 'msg-mini-avatar')}

              <div className="message-bubble">{msg.text}</div>

              {msg.senderId === currentUserId &&
                renderAvatar(currentUser, 'msg-mini-avatar')}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="input-wrapper">
        <input
          type="text"
          placeholder="Write message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleSendMessage}
        />
        {newMessage.trim() && (
          <button className="send-btn" onClick={handleSendMessage}>
            Send
          </button>
        )}
      </div>
    </div>
  )
}

export default Chat
