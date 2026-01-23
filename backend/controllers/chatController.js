import Chat from '../models/Chat.js'

// Получить список всех чатов, в которых участвует пользователь
export const getChats = async (req, res) => {
  try {
    const userId = req.userId
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username avatar fullName') // Загружаем данные собеседников
      .sort({ updatedAt: -1 }) // Самые свежие чаты будут вверху

    res.status(200).json(chats)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении чатов', error })
  }
}

// Создать новый чат или найти существующий
export const createChat = async (req, res) => {
  const { recipientId } = req.body
  const senderId = req.userId

  try {
    // Проверяем, существует ли уже чат между этими двумя юзерами
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    }).populate('participants', 'username avatar fullName')

    if (!chat) {
      // Если чата нет — создаем новый
      chat = new Chat({
        participants: [senderId, recipientId],
      })
      await chat.save()
      chat = await chat.populate('participants', 'username avatar fullName')
    }

    res.status(201).json(chat)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании чата', error })
  }
}
