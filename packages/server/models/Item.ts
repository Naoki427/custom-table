import mongoose, { Document, Schema, Types } from 'mongoose'

// カスタムフィールドの型定義
interface ICustomField {
    label: string
    type: 'number' | 'select' | 'comment'
    value: any // 数値 or 文字列（型制限しない）
}

// 出走馬情報の型定義
interface IHorse {
    name: string
    predictionMark: string // ◎〇▲△など
    fields: ICustomField[]
}

export interface IItem extends Document {
    type: 'folder' | 'memo'
    name: string
    path: string
    parent?: Types.ObjectId
    ancestors: Types.ObjectId[]
    depth: number
    owner: Types.ObjectId
    
    // memo用フィールド（出馬表）
    horses: IHorse[]
    
    createdAt: Date
    updatedAt: Date
}

// カスタムフィールドスキーマ
const CustomFieldSchema = new Schema<ICustomField>(
    {
        label: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        type: {
            type: String,
            enum: ['number', 'select', 'comment'],
            required: true,
        },
        value: {
            type: Schema.Types.Mixed, // 任意の型を許可
        },
    },
    { _id: false } // サブドキュメントにIDを生成しない
)

// 出走馬スキーマ
const HorseSchema = new Schema<IHorse>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        predictionMark: {
            type: String,
            required: true,
            enum: ['◎', '〇', '▲', '△', '×', '？'], // 予想マークの制限
        },
        fields: [CustomFieldSchema],
    },
    { _id: false } // サブドキュメントにIDを生成しない
)

const ItemSchema = new Schema<IItem>(
    {
        type: {
            type: String,
            enum: ['folder', 'memo'],
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        path: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            default: null,
        },
        ancestors: [{
            type: Schema.Types.ObjectId,
            ref: 'Item',
        }],
        depth: {
            type: Number,
            required: true,
            min: 0,
            max: 10, // 階層の深さ制限
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        // memo用フィールド
        horses: {
            type: [HorseSchema],
            default: [],
            validate: {
                validator: function(this: IItem, horses: IHorse[]) {
                    // memoタイプの場合のみバリデーション
                    if (this.type === 'memo') {
                        return horses.length > 0 && horses.length <= 20 // 最大20頭まで
                    }
                    return horses.length === 0 // folderタイプは馬情報なし
                },
                message: 'Horses array validation failed'
            }
        },
    },
    {
        timestamps: true, // createdAt, updatedAt を自動追加
    }
)

// インデックス設定
ItemSchema.index({ owner: 1, type: 1 })
ItemSchema.index({ path: 1 })
ItemSchema.index({ parent: 1 })
ItemSchema.index({ 'horses.name': 1 }) // 馬名検索用

// パス自動生成のミドルウェア
ItemSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('parent') || this.isModified('name')) {
        await this.generatePath()
    }
    next()
})

// パス生成メソッド
ItemSchema.methods.generatePath = async function() {
    if (!this.parent) {
        this.path = `/${this.name}`
        this.ancestors = []
        this.depth = 0
    } else {
        const parentItem = await mongoose.model('Item').findById(this.parent)
        if (parentItem) {
            this.path = `${parentItem.path}/${this.name}`
            this.ancestors = [...parentItem.ancestors, parentItem._id]
            this.depth = parentItem.depth + 1
        }
    }
}

export const Item = mongoose.model<IItem>('Item', ItemSchema)