const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const port = process.env.PORT

const server = http.createServer(app)
const io = socketio(server)

const publicDirectory = path.join(__dirname, '../public')

// Setup static directory to serve
app.use(express.static(publicDirectory))


io.on('connection', (socket) =>{
    //console.log('New WebSocket Connection')

    socket.on('join', (options, callback) =>{
        
        const {error, user} = addUser({id: socket.id, ...options })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Adimn', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))    
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })

    })

    socket.on('submit', (message, callback) =>{

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not Allowed')
        }
        const user = getUser(socket.id)

        //console.log('Message: '+message)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('SendLocation', (location, callback) =>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () =>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `A ${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})


server.listen(port, () => {
    console.log('Server is listening on port', port)
})


// Counting button socket communication
// let count = 0

// io.on('connection', (socket) =>{
//     console.log('New WebSocket Connection')
    
//     socket.emit('countUpdated', count)

//     socket.on('increment', () =>{
//         count++
//         //socket.emit('countUpdated', count)        // send the data to particular soket
//         io.emit('countUpdated', count)              // send data to all the clients
//     })
// })
