import User from '../models/User.js'
import Notification from '../models/Notification.js'

export const searchUsers = async (req, res) => {
  try {
    const search = req.query.search
    let query = { _id: { $ne: req.userId } } // Исключаем текущего пользователя из выдачи сразу на уровне БД

    if (search) {
      // Если есть поиск, ищем по нику
      query.username = { $regex: search, $options: 'i' }
    }

    const users = await User.find(query).select('username avatar fullName')
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Получение базовой информации о пользователе (например, для шапки чата)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username avatar')
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.userId)

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isFollowing = userToFollow.followers.includes(req.userId)

    if (isFollowing) {
      // --- Unfollow ---
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.userId,
      )
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id,
      )

      // (Опционально) Можно удалить уведомление из базы при отписке
      await Notification.findOneAndDelete({
        user: userToFollow._id,
        fromUser: currentUser._id,
        type: 'follow',
      })
    } else {
      // --- Follow ---
      userToFollow.followers.push(req.userId)
      currentUser.following.push(req.params.id)

      // 1. СОХРАНЯЕМ УВЕДОМЛЕНИЕ В БАЗУ (чтобы оно осталось в истории)
      const newNotification = await Notification.create({
        user: userToFollow._id, // кому (ID цели)
        fromUser: currentUser._id, // от кого
        type: 'follow',
        message: 'начал(а) подписываться на вас',
      })

      // 2. ОТПРАВЛЯЕМ ЧЕРЕЗ SOCKET.IO (для живого обновления)
      const receiverSocketId = req.userSockets[req.params.id]
      if (receiverSocketId) {
        // Отправляем полные данные, включая ID уведомления из базы
        req.io.to(receiverSocketId).emit('notification', {
          _id: newNotification._id,
          type: 'follow',
          fromUser: {
            _id: currentUser._id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
          message: newNotification.message,
          createdAt: newNotification.createdAt,
          read: false,
        })
      }
    }

    await userToFollow.save()
    await currentUser.save()

    res.json({
      followersCount: userToFollow.followers.length,
      isFollowing: !isFollowing,
    })
  } catch (err) {
    console.error('Follow error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
