
let typing = false;
let lastTypingTime;

window.addEventListener('load', async (e) => {
  //Joinin room
  socket.emit("join room", chatId);
  socket.on("typing", () => {
    document.querySelector('.typingDots').style.display = "inline";
  });

  socket.on("stop typing", () => {
    document.querySelector('.typingDots').style.display = "none";
  });

  const postData = await fetch(`/api/chats/${chatId}/messages`);
  const response = await postData.json();
  let messages = [];
  let lastSenderId = "";
  response.forEach((message, index) => {
    let html = createMessageHtml(message, response[index + 1], lastSenderId);
    lastSenderId = message.sender._id;
    messages.push(html);
  })

  let messageHTML = messages.join("");
  addMessagesHtmltoPage(messageHTML);
  ScrollToBottom();
  markAllMessagesAsRead();
  $('.loadingSpinnerContainer').remove();
  $('.chatContainer').css("visibility", "visible");
})

const chatMessage = document.querySelector('.chatMessages')
const sendMessageButton = document.querySelector('.sendMessageButton');
const inputTextBox = document.querySelector('.inputTextBox');
sendMessageButton.addEventListener('click', e => {
  messageSubmitted()
}) 



inputTextBox.addEventListener('keydown', async (e) => {
  updateTyping()
  if(e.keyCode === 13) {
    await messageSubmitted();
    e.preventDefault();
  }
}) 

function updateTyping() {
  if(!connected) {
    return;
  }
  if(!typing) {
    typing = true;
    socket.emit("typing", chatId);
  }
  lastTypingTime = new Date().getTime();
  let timerLength = 1000;
  setTimeout(() => {
    let timeNow = new Date().getTime();
    let timeDiff = timeNow - lastTypingTime;
    if(timeDiff >= timerLength && typing) {
      socket.emit("stop typing", chatId);
      typing = false; 
    }
  }, timerLength)
}

async function messageSubmitted() {
  let content = inputTextBox.value.trim();
  if(content !== "") {
    await sendMessage(content)
    inputTextBox.value = "";
    socket.emit("stop typing", chatId);
    typing = false; 
  }

}

async function sendMessage(content) {
  data = {
    content,
    chatId
  }
   const options = {
     method: 'POST',
     headers: {'Content-Type' : 'application/json'},
     body: JSON.stringify(data)
   }
   const postData = await fetch('/api/messages', options);
   const response = await postData.json();
   if(postData.status !== 201) {
      alert('Couldnt send message');
      inputTextBox.value = content;
      return;
   }
   addChatMessageHtml(response);
   if(connected) {
     socket.emit("new message", response)
   }
}

function addChatMessageHtml(message) {
  if(!message || !message._id) {
    alert("Message is not valid");
    return;
  }
  let messageDiv = createMessageHtml(message, null, "");
  addMessagesHtmltoPage(messageDiv);
  ScrollToBottom();
}

function createMessageHtml(message, nextMessage, lastSenderId) {
  let isMine = message.sender._id === userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";
  let sender = message.sender;
  let senderName = `${sender.firstName} ${sender.lastName}`;
  let currentSenderId = sender._id;
  let nextSenderId = nextMessage ? nextMessage.sender._id : "";
  let isFirst = lastSenderId !== currentSenderId;
  let isLast = nextSenderId !== currentSenderId;
  let nameElement = "";
  if(isFirst) {
    liClassName += " first";
    if(!isMine) {
      nameElement = `<span class="senderName">${senderName}</span>`;
    }
  }

  let profileImage = "";
  if(isLast) {
    liClassName += " last";
    profileImage = `<img src="${sender.profilePic}"/>`
  }
  
  let imageContainer = "";

  if(!isMine) {
    imageContainer = `<div class="imageContainer">
      ${profileImage}
    </div>`
  }

  return `
    <li class="message ${liClassName}">
      ${imageContainer}
      <div class="messageContainer">
        ${nameElement}
        <span class="messageBody">
           ${message.content} 
        </span>
      </div>
    </li>
  `
}

function addMessagesHtmltoPage(html) {
  chatMessage.innerHTML += html;
}

function ScrollToBottom() {
  let container = document.querySelector('.chatMessages');
  let scrollHeight = container.scrollHeight;
  container.scrollTop = scrollHeight;
}

async function markAllMessagesAsRead () {
  const options = { method: 'PUT' }
  const postData = await fetch(`/api/chats/${chatId}/messages/markAsRead`, options);
  if(postData.status === 204) {
    refreshMessagesBadge();
  }
}