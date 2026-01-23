import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body

    // Проверка обязательных полей
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Проверка, что пользователь с таким email или username не существует
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email or username already exists' })
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создание пользователя
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
    })
    await user.save()

    res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables')
    }

    // Генерация токена
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })

    // Убираем пароль из ответа
    const { password: pwd, ...userData } = user._doc

    res.json({ token, user: userData })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
