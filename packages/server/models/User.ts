import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    hashedPassword: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        },
        hashedPassword: {
            type: String,
            required: true,
            minlength: 6,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt を自動追加
    }
)

// インデックス設定
UserSchema.index({ email: 1 })

export const User = mongoose.model<IUser>('User', UserSchema)