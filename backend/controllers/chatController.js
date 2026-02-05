import Chat from '../models/Chat.js'

export const getChats = async (req, res) => {
  try {
    const userId = req.userId
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username avatar fullName')
      .sort({ updatedAt: -1 })

    res.status(200).json(chats)
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении чатов', error })
  }
}

export const createChat = async (req, res) => {
  const { recipientId } = req.body
  const senderId = req.userId

  try {
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] },
    }).populate('participants', 'username avatar fullName')

    if (!chat) {
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
