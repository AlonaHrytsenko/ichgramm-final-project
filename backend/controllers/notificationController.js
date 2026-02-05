import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .populate('fromUser', 'username avatar')
      .populate({
        path: 'post',
        populate: [
          { path: 'user', select: 'username avatar followers' },
          { path: 'comments.user', select: 'username avatar' },
        ],
      })
      .sort({ createdAt: -1 })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Error' })
  }
}

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
