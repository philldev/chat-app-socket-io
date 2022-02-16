import { FC, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
const socket = io('ws://localhost:3001')

const Home = () => {
	const [selectedRoom, setSelectedRoom] = useState<ChatRoomModel | null>(null)
	const [username, setUsername] = useState('')
	return (
		<div className='w-screen h-screen overflow-hidden text-sm text-white bg-black'>
			<div className='flex flex-col h-full p-10'>
				<div className='flex flex-col flex-1 w-full max-w-xl mx-auto overflow-hidden bg-black border border-gray-800 rounded-md shadow-xl'>
					<div className='flex items-center justify-between p-4 border-b border-b-gray-800'>
						<div className='font-light'>Chat App</div>
						<div className='font-bold text-blue-500'>{username}</div>
					</div>
					<div className='flex-1 overflow-y-auto'>
						{!selectedRoom && (
							<JoinRoom
								username={username}
								onRoomSelect={(room, username) => {
									setSelectedRoom(room)
									setUsername(username)
								}}
							/>
						)}
						{selectedRoom && (
							<ChatRoom
								room={selectedRoom}
								onLeaveRoom={() => setSelectedRoom(null)}
								username={username}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

type ChatRoomModel = {
	name: string
	id: string
}

const rooms: ChatRoomModel[] = [
	{
		name: 'Room 1 🏚',
		id: 'room-1',
	},
	{
		name: 'Room 2 🏚',
		id: 'room-2',
	},
	{
		name: 'Room 3 🏚',
		id: 'room-3',
	},
]

const JoinRoom: FC<{
	onRoomSelect: (room: ChatRoomModel, name: string) => void
	username?: string
	room?: ChatRoomModel
}> = (props) => {
	const [roomId, setRoomId] = useState(props.room?.id ?? '')
	const [name, setName] = useState(props.username ?? '')
	const invalid = !roomId || !name
	const onJoinClick = () => {
		const selectedRoom = rooms.find((room) => room.id === roomId)
		if (selectedRoom) {
			props.onRoomSelect(selectedRoom, name)
		}
	}
	return (
		<div className='p-4'>
			<div className='space-y-10'>
				<div className='space-y-4'>
					<div className='space-y-2'>
						<label htmlFor=''>Enter Name</label>
						<input
							value={name}
							onChange={(e) => {
								setName(e.target.value)
							}}
							type='text'
							className='w-full h-10 px-2 bg-black border border-gray-800 rounded-md'
						/>
					</div>
					<div className='space-y-2'>
						<label htmlFor=''>Select Room</label>
						<select
							value={roomId}
							onChange={(e) => {
								setRoomId(e.target.value)
							}}
							className='w-full h-10 px-2 bg-black border border-gray-800 rounded-md'
						>
							<option value=''>Select Room</option>
							{rooms.map((room) => (
								<option key={room.id} value={room.id}>
									{room.name}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className='flex justify-end'>
					<button
						disabled={invalid}
						onClick={onJoinClick}
						className='flex items-center justify-center h-8 px-4 text-black bg-white border rounded-md'
					>
						Join
					</button>
				</div>
			</div>
		</div>
	)
}

type MessageModel = {
	username: string
	message: string
	id: string
}

const ChatRoom: FC<{
	onLeaveRoom: () => void
	room: ChatRoomModel
	username: string
}> = (props) => {
	const [messages, setMessages] = useState<MessageModel[]>([])

	useEffect(() => {
		socket.connect()

		socket.emit('join', {
			username: props.username,
			roomId: props.room.id,
		})

		socket.on(`join-${props.room.id}`, (data) => {
			console.log(data)
		})

		socket.on(`message-${props.room.id}`, (data) => {
			const message = data as MessageModel
			setMessages((prev) => [...prev, message])
		})

		return () => {
			socket.disconnect()
		}
	}, [props.username, props.room.id])

	return (
		<div className='relative flex flex-col h-full'>
			<div className='flex items-center justify-between px-4 py-2 space-x-2 bg-gray-900'>
				<span className='font-bold text-yellow-500'>{props.room.name}</span>
				<button
					onClick={props.onLeaveRoom}
					className='flex items-center justify-center h-8 px-4 text-white bg-black border border-gray-800 rounded-md'
				>
					Leave Room
				</button>
			</div>
			<Messages messages={messages} />
			<MessageForm roomId={props.room.id} username={props.username} />
		</div>
	)
}

// example messages
const messages = [
	{
		id: 1,
		name: 'John',
		message: 'Hello',
	},
	{
		id: 2,
		name: 'Jane',
		message: 'Hi',
	},
	{
		id: 3,
		name: 'John',
		message: 'How are you?',
	},
	{
		id: 4,
		name: 'Jane',
		message: 'I am fine',
	},
]

const Messages: FC<{
	messages: MessageModel[]
}> = (props) => {
	return (
		<div className='flex-1 p-4 space-y-6 overflow-y-auto mb-[48px]'>
			{props.messages.map((item) => (
				<div key={item.id} className='space-y-2'>
					<div className='text-xs font-bold'>{item.username}</div>
					<div className='p-2 bg-gray-900 rounded-md w-max'>{item.message}</div>
				</div>
			))}
		</div>
	)
}

const MessageForm: FC<{
	username: string
	roomId: string
}> = (props) => {
	const [message, setMessage] = useState('')

	const onMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (message.length > 0) {
			const data = {
				username: props.username,
				message,
				roomId: props.roomId,
			}
			socket.emit('message', data)
			setMessage('')
		}
	}
	return (
		<div className='absolute inset-x-0 bottom-0 z-10 bg-black border-t border-gray-800'>
			<form onSubmit={onMessageSubmit} className='flex items-center w-full'>
				<input
					value={message}
					onChange={(e) => {
						setMessage(e.target.value)
					}}
					className='flex-1 h-12 px-4 bg-black outline-none'
					type='text'
					placeholder='Type your message here'
				/>
				<button className='px-8 font-bold uppercase border-l border-gray-800'>
					Send
				</button>
			</form>
		</div>
	)
}

export default Home
