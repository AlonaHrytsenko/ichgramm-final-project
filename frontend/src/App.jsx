import React, { useState, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import './App.css'

import NavBar from './components/NavBar'
import Feed from './pages/Feed.jsx'
import Profile from './pages/Profile.jsx'
import Explore from './pages/Explore.jsx'
import Messages from './pages/Messages.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Chat from './components/Chat.jsx'
import Search from './pages/Search.jsx'
import Notifications from './pages/Notifications.jsx'
import Footer from './components/Footer.jsx'
import PostModal from './components/PostModal.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import NotFound from './pages/NotFound.jsx'

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') },
  autoConnect: false,
})

function App() {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const currentUserId = localStorage.getItem('userId')

  // --- СОСТОЯНИЯ ---
  const [posts, setPosts] = useState([]) // Глобальный список постов
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const hideComponent =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password'

  // 1. Загрузка постов при старте
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts')
        setPosts(res.data)
      } catch (err) {
        console.error('Ошибка загрузки постов:', err)
      }
    }
    fetchPosts()
  }, [])

  // 2. Socket.io логика
  useEffect(() => {
    if (token) {
      socket.auth.token = token
      socket.connect()
      socket.on('notification', () =>
        setUnreadNotifications((prev) => prev + 1),
      )
    }
    return () => {
      socket.off('notification')
      socket.disconnect()
    }
  }, [token])
  useEffect(() => {
    // Выполняем закрытие в следующем тике событий, чтобы не прерывать рендер страницы
    const closeOnNavigation = () => setSelectedPost(null)

    closeOnNavigation()
  }, [location.pathname])
  // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

  // Универсальное обновление комментариев/лайков
  const handlePostUpdate = (postId, updatedComments) => {
    // Обновляем в основном массиве
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === postId ? { ...p, comments: updatedComments } : p,
      ),
    )
    // Обновляем в модалке, если она открыта
    setSelectedPost((prev) =>
      prev && prev._id === postId
        ? { ...prev, comments: updatedComments }
        : prev,
    )
  }

  // Удаление поста
  const handlePostDelete = async (postId) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPosts((prev) => prev.filter((p) => p._id !== postId))
      setSelectedPost(null)
    } catch (err) {
      console.error('Ошибка удаления:', err)
    }
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    setIsNotifOpen(false)
  }

  const toggleNotifications = () => {
    setIsNotifOpen(!isNotifOpen)
    setIsSearchOpen(false)
    setUnreadNotifications(0)
  }

  const handleOpenPostFromNotif = (post) => {
    setIsNotifOpen(false)
    setSelectedPost(post)
  }

  return (
    <div className="app">
      {!hideComponent && (
        <NavBar
          unreadCount={unreadNotifications}
          onNotificationsClick={toggleNotifications}
          onSearchClick={toggleSearch}
          onCreateClick={() => setIsCreateModalOpen(true)}
          isSearchOpen={isSearchOpen}
          isNotifOpen={isNotifOpen}
        />
      )}

      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <Notifications
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onPostClick={handleOpenPostFromNotif}
      />

      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Feed posts={posts} onPostClick={setSelectedPost} />}
          />
          <Route
            path="/profile/:id"
            element={
              <Profile
                onPostUpdate={handlePostUpdate}
                onPostClick={setSelectedPost}
              />
            }
          />
          <Route
            path="/explore"
            element={<Explore onPostClick={(post) => setSelectedPost(post)} />}
          />
          <Route path="/messages" element={<Messages socket={socket} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Глобальная модалка поста */}
      {selectedPost && selectedPost.user && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onCommentUpdate={handlePostUpdate}
          onDelete={handlePostDelete}
          currentUserId={currentUserId}
          onEdit={(post) => {
            setEditingPost(post)
            setIsCreateModalOpen(true)
            setSelectedPost(null) // Закрываем просмотр поста
          }}
        />
      )}
      {isCreateModalOpen && (
        <CreatePost
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingPost(null) // Очищаем при закрытии
          }}
          editData={editingPost} // Передаем данные для редактирования
        />
      )}
      {!hideComponent && (
        <Footer
          onSearchClick={toggleSearch}
          onNotifClick={toggleNotifications}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      )}
    </div>
  )
}

export default App
