const socket = io();

const activeUsers = document.querySelector('.active-users');
const messages = document.querySelector('.messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let username = prompt('Enter your name to join :');

if(!username) {
    username = 'Stranger';
}

socket.emit('user joined', username);

socket.emit('send user list', {});

const msgRecievedSound = new Audio('msg-recieved.wav');
const msgSentSound = new Audio('msg-sent.mp3');

socket.on('new user joined', (name) => {
    appendAlertMessage(name, 'joined');
});

socket.on('user left', (name) => {
    appendAlertMessage(name, 'left');
});

function appendAlertMessage(name, type) {
    const element = document.createElement('li');
    element.classList.add('alert');
    element.classList.add(type);
    element.innerHTML = `<span>${name}</span> ${type} the chat`;
    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;
    socket.emit('send user list', {});
}

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(messageInput.value) {
        msgSentSound.play();
        appendChatMessage(messageInput.value, 'sent');
        socket.emit('chat message', messageInput.value);
        messageInput.value = '';
    }
});

socket.on('new message', (data) => {
    msgRecievedSound.play();
    appendChatMessage(data.msg, 'recieved', data.name);
});

function appendChatMessage(message, type, name) {
    const element = document.createElement('li');
    element.classList.add('message');
    element.classList.add(type);
    if(name)
        element.innerHTML = `<span>${name}</span><br> ${message}`;
    else
        element.innerHTML = message;
    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;
}

socket.on('update user list', (names) => {
    const userElements = names.map((name) => {
        if(name === username) {
            return `<li>${name} (You)</li>`
        }
        return `<li>${name}</li>`;
    })
    .join('');
    activeUsers.innerHTML = userElements;
});

const messageContainer = document.querySelector('.message-container');
const typingSection = document.querySelector('.typing');

messageInput.addEventListener('focusin', () => {
    socket.emit('start typing', '');
});

socket.on('user typing', (data) => {
    const element = document.createElement('li');
    element.id = data.id;
    element.classList.add('message');
    element.classList.add('recieved');
    element.innerHTML = `<span>${data.name}</span><br> <div class="dots-3"></div>`;
    typingSection.appendChild(element);
    // messageContainer.scrollTop = typingSection.scrollHeight;
});

messageInput.addEventListener('focusout', () => {
    socket.emit('stop typing', '');
});

socket.on('user stop typing', (userId) => {
    const element = document.querySelector(`#${userId}`);
    if(element)
        typingSection.removeChild(element);
    // messageContainer.scrollTop = typingSection.scrollHeight;
});

const toggleBtn = document.querySelector('.toggle-btn');
const userDisplay = document.querySelector('.active-user-display');

let isDisplayHidden = true;

toggleBtn.addEventListener('click', () => {
    const displayWidth = userDisplay.getBoundingClientRect().width;
    if(isDisplayHidden) {
        userDisplay.style.transform = `translateX(0%)`;
        toggleBtn.style.transform = `translateX(${displayWidth}px) rotate(180deg)`;
        isDisplayHidden = false;
    }
    else {
        userDisplay.style.transform = `translateX(-110%)`;
        toggleBtn.style.transform = `translateX(0px) rotate(0deg)`;
        isDisplayHidden = true;
    }
});