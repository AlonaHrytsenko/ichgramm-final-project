import User from '../models/User.js'

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'Профиль не найден' })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка получения профиля' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    // 1. Получаем все поля, которые могут быть изменены
    const { username, fullName, bio, avatar, website } = req.body

    // 2. Находим текущего пользователя по ID из токена
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }

    // 3. Проверка уникальности username
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res
          .status(400)
          .json({ message: 'This username is already taken' })
      }
      user.username = username
    }

    // 4. Обновляем остальные поля, только если они предоставлены
    if (fullName !== undefined) user.fullName = fullName
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar
    if (website !== undefined) user.website = website // Добавляем website

    // 5. Сохраняем модель. Mongoose сам обойдет конфликт уникальности,
    // если username не менялся.
    await user.save()

    // 6. Убираем пароль и отправляем
    const userWithoutPassword = user.toObject()
    delete userWithoutPassword.password

    res.json(userWithoutPassword)
  } catch (err) {
    console.error(err)
    // 🔑 Обработка ошибки уникальности E11000, если она вдруг всплывет
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'A unique field is already in use.' })
    }
    res.status(500).json({ message: 'Ошибка обновления профиля' })
  }
}
