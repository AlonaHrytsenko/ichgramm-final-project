import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Decoded token:', decoded)
    req.userId = decoded.id // теперь в req.userId хранится id пользователя
    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    res.status(401).json({ message: 'Invalid token' })
  }
}

export default auth
