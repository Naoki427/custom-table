import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { typeDefs } from './graphql/typeDefs'
import { resolvers } from './graphql/resolvers'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const PORT = Number(process.env.PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/sou-hyou?authSource=admin'

async function startServer() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB successfully')

        // Create Apollo Server
        const server = new ApolloServer({
            typeDefs,
            resolvers,
        })

        // Start the server
        const { url } = await startStandaloneServer(server, {
            listen: { port: PORT },
            context: async ({ req }) => {
                // Add authentication context here later
                return {
                    req,
                }
            },
        })

        console.log(`🚀 Apollo Server ready at: ${url}`)
        console.log(`📊 GraphQL Playground available at: ${url}`)
    } catch (error) {
        console.error('❌ Failed to start server:', error)
        process.exit(1)
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down server gracefully...')
    await mongoose.connection.close()
    console.log('✅ MongoDB connection closed')
    process.exit(0)
})

startServer()