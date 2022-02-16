import { FC, useState } from 'react'

const Home = () => {
	const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
	return (
		<div className='w-screen h-screen overflow-hidden text-sm text-white bg-black'>
			<div className='flex flex-col h-full p-10'>
				<div className='flex flex-col flex-1 w-full max-w-xl mx-auto overflow-hidden bg-black border border-gray-800 rounded-md shadow-xl'>
					<div className='flex items-center p-4 border-b border-b-gray-800'>
						<div className='font-light'>Chat App</div>
						<div className='flex items-center justify-end flex-1 space-x-2'>
							<span className='block p-1 px-2 font-bold bg-yellow-900 rounded-md'>
								Room : 1
							</span>
							<span className='block p-1 px-2 font-bold bg-blue-900 rounded-md'>
								Name : John
							</span>
						</div>
					</div>
					<div className='flex-1 overflow-y-auto'>
						{!selectedRoom && (
							<JoinRoom
								onRoomSelect={(room, username) => {
									setSelectedRoom(room)
								}}
							/>
						)}
						{selectedRoom && <Room />}
					</div>
				</div>
			</div>
		</div>
	)
}

const JoinRoom: FC<{
	onRoomSelect: (room: string, name: string) => void
}> = (props) => {
	const [room, setRoom] = useState('')
	const [name, setName] = useState('')
	const invalid = !room || !name
	const onJoinClick = () => {
		props.onRoomSelect(room, name)
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
							value={room}
							onChange={(e) => {
								setRoom(e.target.value)
							}}
							className='w-full h-10 px-2 bg-black border border-gray-800 rounded-md'
						>
							<option value={'room-1'}>Room 1</option>
							<option value={'room-2'}>Room 2</option>
							<option value={'room-3'}>Room 3</option>
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

const Room = () => {
	return (
		<div className='relative h-full'>
			<Chats />
			<MessageForm />
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

const Chats = () => {
	return (
		<div className='p-4 space-y-6'>
			{messages.map((item) => (
				<div key={item.id} className='space-y-2'>
					<div className='text-xs font-bold'>{item.name}</div>
					<div className='p-2 bg-gray-900 rounded-md w-max'>{item.message}</div>
				</div>
			))}
		</div>
	)
}

const MessageForm = () => {
	const [message, setMessage] = useState('')

	const onMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		console.log(message)
	}
	return (
		<div className='absolute inset-x-0 bottom-0 border-t border-gray-800'>
			<form onSubmit={onMessageSubmit} className='flex w-full'>
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
