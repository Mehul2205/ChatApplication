const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) =>{

    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the Data
    if(!username || !room){
        return {
            error: 'Username and Room are required'
        }
    }

    // Check for Existing User
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    // Validate username
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) =>{
    return user = users.find((user) => user.id === id)
}

const getUserInRoom =(room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser, 
    removeUser,
    getUser,
    getUserInRoom
}