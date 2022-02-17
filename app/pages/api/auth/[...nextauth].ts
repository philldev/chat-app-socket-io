import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import db from '../../../prisma/db'

export default NextAuth({
	// Configure one or more authentication providers
	adapter: PrismaAdapter(db),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		// ...add more providers here
	],
	callbacks: {
		session: async ({ user, session }) => {
			session.userId = user.id
			return session
		},
	},
})
