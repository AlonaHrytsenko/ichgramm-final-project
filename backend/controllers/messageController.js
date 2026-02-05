import Message from '../models/Message.js'
import Chat from '../models/Chat.js'

export const getMessages = async (req, res) => {
  const { chatId } = req.params
  const userId = req.userId

  try {
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

export const saveMessage = async (senderId, recipientId, text, chatId) => {
  try {
    const newMessage = new Message({
      chatId,
      senderId,
      text,
    })
    const savedMessage = await newMessage.save()

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
