const socket = io()

// Server(emit) --> Client(recieve) -->Acknowledgement -->Server
// Client(emit) --> Server -->Acknowledgemnt -->Client

//Elements

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

//Templates
const messageTemplate1 = document.querySelector('#message-template1').innerHTML
const messageTemplate2 = document.querySelector('#message-template2').innerHTML
const messageTemplate3 = document.querySelector('#message-template3').innerHTML

// Query
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () =>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) =>{
    //console.log(message)
    const html = Mustache.render(messageTemplate1,{
        username: message.username,
        msg: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) =>{
    //console.log(location)
    const html = Mustache.render(messageTemplate2,{
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render(messageTemplate3, {room, users})
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) =>{
    e.preventDefault()
    
    // Disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('submit', e.target.elements.message.value, (error)=> {
        
        // Enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        
        console.log('The message was delivered!');
    })
})

$locationButton.addEventListener('click', () => {

    // Disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    if(! navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }
    navigator.geolocation.getCurrentPosition((position) =>{
        //console.log(position)
        
        let location = {
            latitude: position['coords']['latitude'],
            longitude: position['coords']['longitude']
        }
        
        socket.emit('SendLocation', location, () =>{

            // Enable
            $messageFormButton.removeAttribute('disabled')

            console.log('The Location was shared Sucessfully')
        })

    })
})


socket.emit('join', {username, room}, (error) ={
    if(error){
        alert(error)
        location.href = '/'
    }
})


// Counting Button Socket
// socket.on('countUpdated', (count) =>{
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () =>{
//     socket.emit('increment')
// })