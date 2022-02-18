import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'

const app = express()
app.use(cors())

const port = process.env.PORT || 3001
const server = http.createServer(app, {})

const io = new Server(server, {
	cors: {
		origin: '*',
	},
})

// generate a random id
const generateId = () => {
	return Math.random().toString(36).substring(2, 15)
}

io.on('connection', (socket) => {
	console.log('a user connected', socket.id)

	socket.on('join', (data) => {
		const users = io.sockets.adapter.rooms.get(data.roomId)?.size
		console.log(users)
		socket.join(data.roomId)
		io.to(data.roomId).emit(`join`, `${data.username} has joined the room`)
	})

	socket.on('message', (data) => {
		console.log(data)
		io.to(data.roomId).emit(`message`, {
			id: generateId(),
			username: data.username,
			message: data.message,
		})
	})

	socket.on('disconnect', () => {
		console.log('user disconnected')
	})
})

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
