import { signIn, useSession } from 'next-auth/react'
import { createContext, FC, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const local = 'http://localhost:3001'
const staging = 'https://chat-app-19902.herokuapp.com/'

const SocketContext = createContext<{ socket: Socket | null } | null>(null)

const SocketProvider: FC = (props) => {
	const [socket, setSocket] = useState<Socket | null>(null)
	useEffect(() => {
		const newSocket = io(local)
		setSocket(newSocket)
		return () => {
			newSocket.disconnect()
		}
	}, [])
	return (
		<SocketContext.Provider value={{ socket }}>
			{props.children}
		</SocketContext.Provider>
	)
}
const useSocket = () => {
	const socket = useContext(SocketContext)
	if (!socket) {
		throw new Error('Socket not initialized')
	}
	return socket
}

const Home = () => {
	const [selectedRoom, setSelectedRoom] = useState<ChatRoomModel | null>(null)
	const { status, data: session } = useSession()
	return (
		<SocketProvider>
			<div className='w-screen h-screen overflow-hidden text-sm text-white bg-black'>
				<div className='flex flex-col h-full p-10'>
					<div className='flex flex-col flex-1 w-full max-w-xl mx-auto overflow-hidden bg-black border border-gray-800 rounded-md shadow-xl'>
						<div className='flex items-center justify-between p-4 border-b border-b-gray-800'>
							<div className='font-light'>Chat App</div>
							<div className='font-bold text-blue-500'>
								{session?.user?.name}
							</div>
						</div>
						<div className='flex-1 overflow-y-auto'>
							{status === 'loading' && <div>Loading...</div>}
							{status === 'unauthenticated' && <Login />}
							{status === 'authenticated' && (
								<>
									{!selectedRoom && (
										<JoinRoom
											onRoomSelect={(room) => {
												setSelectedRoom(room)
											}}
											username={session?.user?.name!}
										/>
									)}
									{selectedRoom && (
										<ChatRoom
											room={selectedRoom}
											onLeaveRoom={() => setSelectedRoom(null)}
											username={session?.user?.name!}
										/>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</SocketProvider>
	)
}

const Login = () => {
	return (
		<div className='flex items-center justify-center h-full'>
			<div className='flex flex-col items-center justify-center space-y-4'>
				<p className='font-light text-gray-400'>
					You are not logged in. Please login to continue.
				</p>
				<button
					onClick={() => signIn('google')}
					className='flex items-center justify-center h-8 px-4 font-bold bg-red-600 rounded-md'
				>
					Login With Google
				</button>
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
	onRoomSelect: (room: ChatRoomModel) => void
	username?: string
	room?: ChatRoomModel
}> = (props) => {
	const [roomId, setRoomId] = useState(props.room?.id ?? '')
	// const [name, setName] = useState(props.username ?? '')
	const invalid = !roomId
	const onJoinClick = () => {
		const selectedRoom = rooms.find((room) => room.id === roomId)
		if (selectedRoom) {
			props.onRoomSelect(selectedRoom)
		}
	}
	return (
		<div className='p-4'>
			<div className='space-y-10'>
				<div className='space-y-4'>
					<div className='space-y-2'>
						<label htmlFor=''>Name</label>
						<input
							defaultValue={props.username}
							disabled
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

interface MessageModel {
	username?: string
	message: string
	id: string
}

const ChatRoom: FC<{
	onLeaveRoom: () => void
	room: ChatRoomModel
	username: string
}> = (props) => {
	const { socket } = useSocket()
	const [messages, setMessages] = useState<MessageModel[]>([])

	useEffect(() => {
		if (socket) {
			socket.emit('join', {
				username: props.username,
				roomId: props.room.id,
			})

			socket.on('join', (data) => {
				const info = { message: data } as MessageModel
				info.id = `${info.id}-${Math.random()}`
				setMessages((prev) => [...prev, info])
			})

			socket.on('message', (data) => {
				console.log(data)
				const message = data as MessageModel
				setMessages((prev) => [...prev, message])
			})
		}
	}, [props.username, props.room.id, socket])

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

const Messages: FC<{
	messages: MessageModel[]
}> = (props) => {
	return (
		<div className='flex-1 p-4 space-y-4 overflow-y-auto mb-[48px]'>
			{props.messages.map((item, index) =>
				!item.username ? (
					<div key={index}>{item.message}</div>
				) : props.messages[index - 1]?.username === item.username ? (
					<div key={index} className='mt-[0 !important] space-y-2'>
						<div className='p-2 bg-gray-900 rounded-md w-max'>
							{item.message}
						</div>
					</div>
				) : (
					<div key={index} className='space-y-2'>
						<div className='text-xs font-bold'>{item.username}</div>
						<div className='p-2 bg-gray-900 rounded-md w-max'>
							{item.message}
						</div>
					</div>
				)
			)}
		</div>
	)
}

const MessageForm: FC<{
	username: string
	roomId: string
}> = (props) => {
	const [message, setMessage] = useState('')
	const { socket } = useSocket()

	const onMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (message.length > 0) {
			const data = {
				username: props.username,
				message,
				roomId: props.roomId,
			}
			socket?.emit('message', data)
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
