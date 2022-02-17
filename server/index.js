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
	console.log('a user connected')

	socket.on('create-room', (id) => {
		socket.join(id)
	})

	socket.on('join', (data) => {
		console.log(data)
		socket.broadcast.emit(
			`join-${data.roomId}`,
			`${data.username} has joined the room`
		)
	})

	socket.on('message', (data) => {
		console.log(data)
		socket.emit(`message-${data.roomId}`, {
			id: generateId(),
			username: data.username,
			message: data.message,
		})
		socket.broadcast.emit(`message-${data.roomId}`, {
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
