import { gql } from 'graphql-tag'

export const typeDefs = gql`
    scalar Date

    type User {
        id: ID!
        name: String!
        email: String!
        createdAt: Date!
        updatedAt: Date!
    }

    type CustomField {
        label: String!
        type: FieldType!
        value: String
    }

    enum FieldType {
        number
        select
        comment
    }

    type Horse {
        name: String!
        predictionMark: PredictionMark!
        fields: [CustomField!]!
    }

    enum PredictionMark {
        HONMEI      # ◎
        TAIKOU      # 〇
        TANANA      # ▲
        OSHI        # △
        BATSU       # ×
        QUESTION    # ？
    }

    type Item {
        id: ID!
        type: ItemType!
        name: String!
        path: String!
        parent: Item
        ancestors: [Item!]!
        depth: Int!
        owner: User!
        
        # memo用フィールド
        horses: [Horse!]!
        
        createdAt: Date!
        updatedAt: Date!
    }

    enum ItemType {
        folder
        memo
    }

    type Query {
        # Health check
        hello: String!
        
        # User queries
        me: User
        
        # Item queries
        items(type: ItemType, parentId: ID): [Item!]!
        item(id: ID!): Item
        searchItemsByHorseName(horseName: String!): [Item!]!
        
        # Folder specific queries
        folders(parentId: ID): [Item!]!
        
        # Memo specific queries  
        memos(folderId: ID): [Item!]!
    }

    type Mutation {
        # User mutations
        createUser(input: CreateUserInput!): User!
        updateUser(input: UpdateUserInput!): User!
        
        # Item mutations
        createFolder(input: CreateFolderInput!): Item!
        createMemo(input: CreateMemoInput!): Item!
        updateItem(id: ID!, input: UpdateItemInput!): Item!
        deleteItem(id: ID!): Boolean!
        
        # Move item
        moveItem(id: ID!, newParentId: ID): Item!
    }

    # Input types
    input CreateUserInput {
        name: String!
        email: String!
        password: String!
    }

    input UpdateUserInput {
        name: String
        email: String
        password: String
    }

    input CreateFolderInput {
        name: String!
        parentId: ID
    }

    input CustomFieldInput {
        label: String!
        type: FieldType!
        value: String
    }

    input HorseInput {
        name: String!
        predictionMark: PredictionMark!
        fields: [CustomFieldInput!]!
    }

    input CreateMemoInput {
        name: String!
        parentId: ID
        horses: [HorseInput!]!
    }

    input UpdateItemInput {
        name: String
        horses: [HorseInput!]
    }
`