import Notification from '../models/Notification.js'

// Получить все уведомления пользователя
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .populate('fromUser', 'username avatar') // Кто лайкнул
      .populate({
        path: 'post',
        populate: [
          { path: 'user', select: 'username avatar followers' }, // Автор поста
          { path: 'comments.user', select: 'username avatar' }, // Авторы комментов!
        ],
      })
      .sort({ createdAt: -1 })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Error' })
  }
}

// Создать новое уведомление
export const createNotification = async (req, res) => {
  try {
    const { user, type, fromUser, post, message } = req.body

    const newNotification = new Notification({
      user,
      type,
      fromUser,
      post,
      message,
    })

    const savedNotification = await newNotification.save()
    res.status(201).json(savedNotification)
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Ошибка при создании уведомления', error: err.message })
  }
}

// Отметить уведомление как прочитанное
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true },
    )
    res.status(200).json(notification)
  } catch (err) {
    res.status(500).json({
      message: 'Ошибка при обновлении уведомления',
      error: err.message,
    })
  }
}
