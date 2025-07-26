import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { User, Item } from '../models'
import bcrypt from 'bcrypt'

// Date scalar resolver
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value: any) {
        if (value instanceof Date) {
            return value.getTime()
        }
        throw Error('GraphQL Date Scalar serializer expected a `Date` object')
    },
    parseValue(value: any) {
        if (typeof value === 'number') {
            return new Date(value)
        }
        throw new Error('GraphQL Date Scalar parser expected a `number`')
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10))
        }
        return null
    },
})

// Enum mapping
const PredictionMarkMap = {
    HONMEI: '◎',
    TAIKOU: '〇', 
    TANANA: '▲',
    OSHI: '△',
    BATSU: '×',
    QUESTION: '？'
}

const PredictionMarkReverseMap = {
    '◎': 'HONMEI',
    '〇': 'TAIKOU',
    '▲': 'TANANA', 
    '△': 'OSHI',
    '×': 'BATSU',
    '？': 'QUESTION'
}

export const resolvers = {
    Date: dateScalar,

    PredictionMark: {
        HONMEI: '◎',
        TAIKOU: '〇',
        TANANA: '▲', 
        OSHI: '△',
        BATSU: '×',
        QUESTION: '？'
    },

    Query: {
        hello: () => 'Hello from Apollo Server with new Item-based structure! 🚀',
        
        me: async (parent: any, args: any, context: any) => {
            // TODO: Implement authentication context
            const user = await User.findOne().limit(1)
            return user || {
                id: 'demo',
                name: 'Demo User',
                email: 'demo@example.com',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        },

        items: async (parent: any, { type, parentId }: { type?: string, parentId?: string }, context: any) => {
            const filter: any = {
                // TODO: Add owner filter when auth is implemented
                // owner: context.userId
            }
            
            if (type) filter.type = type
            if (parentId) {
                filter.parent = parentId
            } else if (parentId === null) {
                filter.parent = null // ルートアイテム
            }

            return await Item.find(filter)
                .populate('owner')
                .populate('parent')
                .populate('ancestors')
                .sort({ createdAt: -1 })
        },

        item: async (parent: any, { id }: { id: string }, context: any) => {
            return await Item.findById(id)
                .populate('owner')
                .populate('parent')
                .populate('ancestors')
        },

        searchItemsByHorseName: async (parent: any, { horseName }: { horseName: string }, context: any) => {
            return await Item.find({
                type: 'memo',
                'horses.name': { $regex: horseName, $options: 'i' }
                // TODO: Add owner filter
            })
                .populate('owner')
                .populate('parent')
                .populate('ancestors')
        },

        folders: async (parent: any, { parentId }: { parentId?: string }, context: any) => {
            const filter: any = { type: 'folder' }
            if (parentId) {
                filter.parent = parentId
            } else {
                filter.parent = null
            }

            return await Item.find(filter)
                .populate('owner')
                .populate('parent')
                .sort({ name: 1 })
        },

        memos: async (parent: any, { folderId }: { folderId?: string }, context: any) => {
            const filter: any = { type: 'memo' }
            if (folderId) {
                filter.parent = folderId
            }

            return await Item.find(filter)
                .populate('owner')
                .populate('parent')
                .sort({ createdAt: -1 })
        },
    },

    Mutation: {
        createUser: async (parent: any, { input }: any, context: any) => {
            const { name, email, password } = input
            
            // パスワードハッシュ化
            const hashedPassword = await bcrypt.hash(password, 10)
            
            const user = new User({
                name,
                email,
                hashedPassword,
            })
            
            return await user.save()
        },

        updateUser: async (parent: any, { input }: any, context: any) => {
            // TODO: Get userId from context
            const userId = 'demo-user-id'
            
            const updateData: any = {}
            if (input.name) updateData.name = input.name
            if (input.email) updateData.email = input.email
            if (input.password) {
                updateData.hashedPassword = await bcrypt.hash(input.password, 10)
            }

            return await User.findByIdAndUpdate(userId, updateData, { new: true })
        },

        createFolder: async (parent: any, { input }: any, context: any) => {
            // TODO: Get userId from context
            const demoUser = await User.findOne().limit(1)
            if (!demoUser) {
                throw new Error('User not found')
            }

            const folder = new Item({
                type: 'folder',
                name: input.name,
                parent: input.parentId || null,
                owner: demoUser._id,
                horses: [], // フォルダは馬情報なし
            })
            
            return await folder.save()
        },

        createMemo: async (parent: any, { input }: any, context: any) => {
            // TODO: Get userId from context
            const demoUser = await User.findOne().limit(1)
            if (!demoUser) {
                throw new Error('User not found')
            }

            // 予想マークをDBの形式に変換
            const horses = input.horses.map((horse: any) => ({
                ...horse,
                predictionMark: PredictionMarkMap[horse.predictionMark as keyof typeof PredictionMarkMap]
            }))

            const memo = new Item({
                type: 'memo',
                name: input.name,
                parent: input.parentId || null,
                owner: demoUser._id,
                horses,
            })
            
            return await memo.save()
        },

        updateItem: async (parent: any, { id, input }: any, context: any) => {
            const updateData: any = {}
            
            if (input.name) updateData.name = input.name
            if (input.horses) {
                // 予想マークをDBの形式に変換
                updateData.horses = input.horses.map((horse: any) => ({
                    ...horse,
                    predictionMark: PredictionMarkMap[horse.predictionMark as keyof typeof PredictionMarkMap]
                }))
            }

            return await Item.findByIdAndUpdate(id, updateData, { new: true })
                .populate('owner')
                .populate('parent')
                .populate('ancestors')
        },

        deleteItem: async (parent: any, { id }: { id: string }, context: any) => {
            // 子アイテムも削除
            await Item.deleteMany({ parent: id })
            await Item.findByIdAndDelete(id)
            return true
        },

        moveItem: async (parent: any, { id, newParentId }: any, context: any) => {
            const item = await Item.findById(id)
            if (!item) {
                throw new Error('Item not found')
            }

            item.parent = newParentId || null
            await item.save() // pre saveフックでpathとancestorsが更新される

            return await Item.findById(id)
                .populate('owner')
                .populate('parent')
                .populate('ancestors')
        },
    },

    // Type resolvers
    Item: {
        parent: async (parent: any) => {
            if (parent.parent) {
                return await Item.findById(parent.parent)
            }
            return null
        },
        
        ancestors: async (parent: any) => {
            if (parent.ancestors && parent.ancestors.length > 0) {
                return await Item.find({ _id: { $in: parent.ancestors } })
            }
            return []
        },

        owner: async (parent: any) => {
            return await User.findById(parent.owner)
        },

        horses: (parent: any) => {
            // 予想マークをGraphQLの形式に変換
            return parent.horses.map((horse: any) => ({
                ...horse,
                predictionMark: PredictionMarkReverseMap[horse.predictionMark as keyof typeof PredictionMarkReverseMap]
            }))
        }
    },
}