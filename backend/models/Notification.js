import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    // Тот, КТО получает уведомление
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Добавляем индекс для быстрого поиска уведомлений конкретного юзера
    },
    // Тип уведомления
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'message'], // Добавил 'message', если захочешь хранить историю сообщений
      required: true,
    },
    // Тот, КТО совершил действие
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Ссылка на пост (если это лайк или коммент)
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    // Текст комментария или превью сообщения
    message: {
      type: String,
      trim: true, // Удаляет лишние пробелы по краям
    },
    // Прочитано или нет
    read: {
      type: Boolean,
      default: false,
      index: true, // Поможет быстро считать количество только непрочитанных (unreadCount)
    },
  },
  { timestamps: true }
)

// Индекс для сортировки по времени (чтобы новые уведомления всегда были сверху)
notificationSchema.index({ createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
