import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../pages/Messages.css'

const Chat = ({ chat, currentUserId, socket }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const token = localStorage.getItem('token')

  // Определяем собеседника
  const recipient = chat.participants.find((p) => p._id !== currentUserId)

  // 1. ЗАГРУЗКА ИСТОРИИ СООБЩЕНИЙ
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${chat._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setMessages(res.data)
      } catch (err) {
        console.error('Ошибка при загрузке сообщений:', err)
      }
    }

    if (chat._id) {
      fetchMessages()
      // Присоединяемся к комнате сокета по ID чата
      socket.emit('join_chat', chat._id)
    }

    // Слушаем новые сообщения через сокет
    socket.on('receiveMessage', (message) => {
      // Добавляем сообщение, только если оно относится к текущему открытому чату
      if (message.chatId === chat._id) {
        setMessages((prev) => [...prev, message])
      }
    })

    return () => {
      socket.off('receiveMessage')
    }
  }, [chat._id, socket, token])

  // 2. АВТОПРОКРУТКА ВНИЗ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 3. ОТПРАВКА СООБЩЕНИЯ
  const handleSendMessage = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && newMessage.trim()) {
      const messageData = {
        chatId: chat._id,
        to: recipient._id,
        message: newMessage,
        senderId: currentUserId,
      }

      // Отправляем через сокет (бэкенд сам сохранит в базу через saveMessage)
      socket.emit('sendMessage', messageData)
      setNewMessage('')
    }
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <img
          src={recipient?.avatar}
          alt="avatar"
          onClick={() => navigate(`/profile/${recipient._id}`)}
          className="header-avatar"
        />
        <span className="header-username">{recipient?.username}</span>
      </div>

      <div className="messages-display">
        {/* Инфо-блок собеседника в начале истории */}
        <div className="chat-user-info-center">
          <img
            src={recipient?.avatar}
            alt="avatar"
            onClick={() => navigate(`/profile/${recipient._id}`)}
          />
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
          {' '}
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-bubble-wrapper ${msg.senderId === currentUserId ? 'own' : 'other'}`}
            >
              {/* Аватарка собеседника (слева) */}
              {msg.senderId !== currentUserId && (
                <img
                  src={recipient?.avatar}
                  className="msg-mini-avatar"
                  alt="recipient avatar"
                />
              )}

              <div className="message-bubble">{msg.text}</div>

              {/* НОВОЕ: Аватарка текущего пользователя (справа) */}
              {msg.senderId === currentUserId && (
                <img
                  src={
                    chat.participants.find((p) => p._id === currentUserId)
                      ?.avatar
                  }
                  className="msg-mini-avatar"
                  alt="my avatar"
                />
              )}
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
