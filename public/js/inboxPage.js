window.onload = async () => {
  const postData = await fetch('/api/chats');
  const response = await postData.json();
  const resultsContainer = document.querySelector('.resultsContainer');
  if(response.status === 400) {
    return alert('Couldnt get chat list');
  }
  outPutChatList(response, resultsContainer);
}

function outPutChatList(chatList, container) {
  chatList.forEach((chat) => {
    let html = createChatHtml(chat);
    container.insertAdjacentHTML('afterbegin', html);
  })
  if(chatList.length === 0) {
    container.innerHTML = "<span class='noPosts'> No chats were found </span>"
  }
}



function getLatestMessage(latestMessage) {
  if(latestMessage !== undefined) {
    let sender = latestMessage.sender;
    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }
  return "New chat";
}

function getChatName(chatData) {
  let chatName = chatData.chatName;
  if(!chatName) {
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let namesArray = otherChatUsers.map((user) => user.firstName + " " + user.lastName);
    chatName = namesArray.join(", ");
  }
  return chatName;  
}

function getOtherChatUsers(users) {
  if(users.length === 1) return users;
   return users.filter(user => user._id !== userLoggedIn._id);
}

function getChatImageElements(chatData) {
    let otherChatUsers = getOtherChatUsers(chatData.users);
    let groupChatCalss = "";
    let chatImage = getChatImageElement(otherChatUsers[0]);
    if(otherChatUsers.length > 1) {
      groupChatCalss = "groupChatImage";
      chatImage += getChatImageElement(otherChatUsers[1]);
    }
    return `
      <div class="resultsImageContainer ${groupChatCalss}">${chatImage}</div>
    `
}

function getChatImageElement(user) {
  if(!user || !user.profilePic) {
    return alert('User profile pic was not populated');
  };

  return `<img src="${user.profilePic}" alt="users profile pic"/>`;
}