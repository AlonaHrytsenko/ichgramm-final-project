import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'message'],
      required: true,
    },

    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },

    message: {
      type: String,
      trim: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
)

notificationSchema.index({ createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
