import express from 'express'
import http from 'http'
import cors from 'cors'
const app = express()
app.use(cors)
const port = process.env.PORT || 3000
const server = http.createServer(app, {})

server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
