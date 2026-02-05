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
    const { username, fullName, bio, avatar, website } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' })
    }
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res
          .status(400)
          .json({ message: 'This username is already taken' })
      }
      user.username = username
    }

    if (fullName !== undefined) user.fullName = fullName
    if (bio !== undefined) user.bio = bio
    if (avatar !== undefined) user.avatar = avatar
    if (website !== undefined) user.website = website

    await user.save()

    const userWithoutPassword = user.toObject()
    delete userWithoutPassword.password

    res.json(userWithoutPassword)
  } catch (err) {
    console.error(err)

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: 'A unique field is already in use.' })
    }
    res.status(500).json({ message: 'Ошибка обновления профиля' })
  }
}
