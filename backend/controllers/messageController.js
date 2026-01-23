import Message from '../models/Message.js'
import Chat from '../models/Chat.js'

// Получить историю сообщений конкретного чата
export const getMessages = async (req, res) => {
  const { chatId } = req.params
  const userId = req.userId // меняем здесь

  try {
    // Проверка: является ли пользователь участником чата
    const chat = await Chat.findById(chatId)
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Нет доступа к этой переписке' })
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 })
    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' })
  }
}

// Функция для использования внутри Socket.io (сохранение сообщения)
export const saveMessage = async (senderId, recipientId, text, chatId) => {
  try {
    // 1. Создаем и сохраняем само сообщение
    const newMessage = new Message({
      chatId,
      senderId,
      text,
    })
    const savedMessage = await newMessage.save()

    // 2. ОБЯЗАТЕЛЬНО обновляем модель Chat, чтобы зафиксировать последнее сообщение
    // Это нужно для того, чтобы в левой колонке обновился текст и время
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text,
        sender: senderId,
        createdAt: new Date(),
      },
    })

    return savedMessage
  } catch (error) {
    console.error('Ошибка сохранения сообщения в БД:', error)
    throw error
  }
}
