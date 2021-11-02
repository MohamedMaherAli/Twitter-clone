//GLOBALS
let cropper;
let timerChatSearch;
let selectedUsers = [];


window.addEventListener('DOMContentLoaded',  (event) => {
     refreshMessagesBadge();
     refreshNotificationsBadge();
});


//Post button enabler/disabler handler => For creating a post
const textBox = document.getElementById('postTextarea');
const submitButton = document.getElementById('submitPostButton');
if(textBox) {
  textBox.addEventListener("keyup", (e) => {
    const value = textBox.value.trim();
    if(value === "") {
      submitButton.disabled = true;
      return;
    }
    submitButton.disabled = false;
  })
  
}

//Comment button enabler/disabler => for creating a comment
const replyBox = document.getElementById('replyTextarea');
const replyButton = document.getElementById('submitReplyButton');
if(replyButton) {
  replyBox.addEventListener("keyup", (e) => {
    const value = replyBox.value.trim();
    if(value === "") {
      replyButton.disabled = true;
      return;
    }
    replyButton.disabled = false;
  })
}


//  1- Handle submit post
const submitPostButton = document.getElementById('submitPostButton');
if(submitButton) {
  submitPostButton.addEventListener('click', async (e) => {

    const data = {
      content: textBox.value
    }
  
    const options = {
      method : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  
    const postData = await fetch("/api/posts", options);
    const response = await postData.json();
    const html = createPostsHtml(response);
    let postsContainer = document.querySelector('.postsContainer');
    postsContainer.insertAdjacentHTML("afterbegin", html);
    textBox.value = "";
    submitButton.disabled = true;
  })
}



// 2- Handle submit Comment 
const submitReplyButton = document.getElementById('submitReplyButton');
const replyTextBox = document.getElementById('replyTextarea');
if(submitReplyButton) {
  submitReplyButton.addEventListener('click', async (e) => {

    const postId = submitReplyButton.getAttribute('postId');
    if(postId === null) {
      alert('post id is null : handle submit comment function');
    }
  
    const data = {
      content: replyTextBox.value,
      replyTo: postId
    }
  
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)  
    }
  
    const postData = await fetch('/api/posts', options);
    const response = await postData.json();
    emitNotification(response.replyTo.postedBy);
    
  
    replyTextBox.value = "";
    submitReplyButton.disabled = true;
    location.reload();
  })
  
}

// 3- Handle comment button to show the post in modal
const replyModal = document.getElementById('replyModal');
if(replyModal) {
  replyModal.addEventListener('show.bs.modal', async (e) => {
    const button = e.relatedTarget;
    const postId = getPostIdFromElement(button);
    //attach post id to submit button data so we can use it later when we post the reply
    const submitReplyButton = document.querySelector('#submitReplyButton');
    submitReplyButton.setAttribute("postId", postId);
  
    const options = {method: 'GET'};
    const getData = await fetch(`/api/posts/${postId}`, options);
    const response = await getData.json();
    const originalPostContainer = document.getElementById('originalPostContainer');
    outPutPosts(response.postData, originalPostContainer);
  })  

  replyModal.addEventListener('hidden.bs.modal', (e) => {
    const originalPostContainer = document.getElementById('originalPostContainer');
    originalPostContainer.textContent = "";
  })
}

// Handle preview image upload
// using jquery for filecropperJs
$('#filePhoto').change(function (){
  if(this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      let imagePreview = document.querySelector('#imagePreview');
      imagePreview.src = e.target.result;
      if(cropper !== undefined) {
        cropper.destroy();
      }
      cropper = new Cropper(imagePreview, {
        aspectRatio: 1/1,
        background: false
      });
    }
    reader.readAsDataURL(this.files[0]);
  }
})

$('#coverPhoto').change(function (){
  if(this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      let imagePreview = document.querySelector('#coverPreview');
      imagePreview.src = e.target.result;
      if(cropper !== undefined) {
        cropper.destroy();
      }
      cropper = new Cropper(imagePreview, {
        aspectRatio: 16 / 9,
        background: false
      });
    }
    reader.readAsDataURL(this.files[0]);
  }
})

$('#imageUploadButton').click(() => {
  let canvas = cropper.getCroppedCanvas();
  if(canvas === null) {
    return alert('Could not upload image, make sure its an image file');
  };

  canvas.toBlob((blob) => {
    let formData = new FormData();
    formData.append("croppedImage", blob);
    $.ajax({
      url: '/api/users/profilePicture',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload()
    })
  })
})

$('#coverPhotoButton').click(() => {
  let canvas = cropper.getCroppedCanvas();

  if(canvas === null) {
    return alert('Could not upload image, make sure its an image file');
  };

  canvas.toBlob((blob) => {
    let formData = new FormData();
    formData.append("croppedImage", blob);
    $.ajax({
      url: '/api/users/coverPhoto',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload()
    })
  })
})



// Handle like button
document.addEventListener('click', async (e)=> {
  if(e.target.classList.contains("likeButton")) {
    const button = e.target;
    const postId = getPostIdFromElement(button);
    const options = { method: 'PUT' };
    const postData = await fetch(`/api/posts/${postId}/like`, options);
    const response = await postData.json();
    const userId = userLoggedIn._id;
    button.querySelector("span").textContent = response.likes.length || "";
    if(response.likes.includes(userId)) {
      button.classList.add("active")
      emitNotification(response.postedBy);
    }else {
      button.classList.remove("active")
    }
  }
});

//Handle retweet button
document.addEventListener('click', async(e) => {
  if(e.target.classList.contains('retweetButton')) {
    const button = e.target;
    const postId = getPostIdFromElement(button);
    const options = { method: 'POST' };
    const postData = await fetch(`/api/posts/${postId}/retweet`, options);
    const response = await postData.json();
    button.querySelector('span').textContent = response.retweetUsers.length || "";
    if(response.retweetUsers.includes(userLoggedIn._id)) {
      button.classList.add('active');
      emitNotification(response.postedBy);
    }else {
      button.classList.remove('active');
    }
  }
})


//Handle delete post
//Getting postId from X button and passing it to submit delete
const deleteModal = document.getElementById('deletePostModal');
const deletePostButton = document.getElementById('deletePostButton');
if(deleteModal) {
  deleteModal.addEventListener('show.bs.modal', async (e) => {
    const button = e.relatedTarget;
    const postId = button.getAttribute('data-id')
    deletePostButton.setAttribute("postId", postId);
  })
}
// deleting the post after getting the postId
if(deletePostButton) {
  deletePostButton.addEventListener('click', async (e) => {
    const postId = deletePostButton.getAttribute('postId');
    if(postId === null) {
      alert('post id is null : delete post function');
    };
  
    const options = {
      method: 'DELETE',  
    }
  
    await fetch( `/api/posts/${postId}`, options);
  
    location.reload();
  })
}


//Handle pinning post
//Getting post id from the pin button and pass it to the pin modal
const confirmPinModal = document.querySelector('#confirmPinModal');
const pinPostButton = document.querySelector('#pinPostButton');
if(confirmPinModal) {
  confirmPinModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const postId = button.getAttribute('data-id');
    pinPostButton.setAttribute("postId", postId);
  })
}

//Pinning the post
if(pinPostButton) {
  pinPostButton.addEventListener('click', async (e) => {
    const postId = pinPostButton.getAttribute('postId');
    if(postId === null) {
      alert('post id is null: pin modal function');
      return;
    }
    const data =  {pinned: true };
    const options = {
      method: 'PUT',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify(data)
    }

    await fetch(`api/posts/${postId}`, options);

    location.reload();
  })
}


//Handle unpinning post
//Getting post id from the pin button and pass it to the pin modal
const unpinModal = document.querySelector('#unpinModal');
const unpinPostButton = document.querySelector('#unpinPostButton');
if(unpinModal) {
  unpinModal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const postId = button.getAttribute('data-id');
    unpinPostButton.setAttribute("postId", postId);
  })
}
//UnPinning the post
if(unpinPostButton) {
  unpinPostButton.addEventListener('click', async (e) => {
    const postId = unpinPostButton.getAttribute('postId');
    if(postId === null) {
      alert('post id is null: pin modal function');
      return;
    }

    const data =  {pinned: false };
    const options = {
      method: 'PUT',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify(data)
    }
     fetch(`api/posts/${postId}`, options)
     .then((data) => console.log(data))
     .catch((e) => console.log(e));


    location.reload();

  })
}

// handle search chat users
const userSearchTextBox = document.querySelector('#userSearchTextBox');
if(userSearchTextBox) {
  userSearchTextBox.addEventListener('keydown', (e) => {
    const resultsContainer = document.querySelector('.resultsContainer');
    clearTimeout(timerChatSearch);

    let value = userSearchTextBox.value.trim();
    if(value === "" && e.keyCode === 8) {
      //Remove user 
      selectedUsers.pop();
      console.log(selectedUsers);
      updateSelectedUsersHtml();
      document.querySelector('.resultsContainer').innerHtml = "";
      if(selectedUsers.length === 0) {
        document.querySelector('#createChatButton').disabled = true;
      }
      return;
    }

    timerChatSearch = setTimeout(async () => {
      value = userSearchTextBox.value.trim();
      if(value === "") {
        return resultsContainer.innerHTML = "";
      }else {
        searchUsers(value);
      }

    }, 1000);
  })
}



// Handle post page
document.addEventListener('click', (e) =>{

  if(e.target.classList.contains('post')) {
    const postId = e.target.getAttribute('data-id');
    if(postId) {
      window.location.href = `/posts/${postId}`;
    }

  }
})

// Handle follow button
document.addEventListener('click', async (e) => {
  if(e.target.classList.contains('followButton')) {
    const button = e.target;
    const userId = button.getAttribute('data-user');
    const options = { method: 'PUT' };
    const postData = await fetch(`/api/users/${userId}/follow`, options);
    if(postData.status === 404) {
      alert('User not found!');
      return;
    }
    const response  = await postData.json();
    let difference = 1;
    if(response.following && response.following.includes(userId)) {
      button.classList.add('following');
      button.textContent = "Following";
      emitNotification(userId);
    }else {
      button.classList.remove('following');
      button.textContent = "Follow";
      difference = -1;
    }

    let followersLabel = document.querySelector('#followersValue');
    if(followersLabel) {
      let followersText = followersLabel.textContent;
      followersText = parseInt(followersText);
      followersLabel.textContent = followersText + difference;
    }

  }
})


//Handle create chat button
const createChatButton = document.querySelector('#createChatButton');
if(createChatButton) {
  createChatButton.addEventListener('click', async (e) => {
    const data = JSON.stringify(selectedUsers);
    const options = {
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: data
    };
    const postData = await fetch("/api/chats", options);
    const response = await postData.json();
    window.location.href = `/messages/${response._id}`;
  })
}


// Handle notification click
document.addEventListener('click', async (e) => {
  if(e.target.classList.contains('notification') && e.target.classList.contains('active')) {
    let container = e.target;
    let notificationId = container.getAttribute('data-id');
    let href = container.getAttribute('href');
    e.preventDefault();
    let callBack = () => window.location = href;
    await markNotificationsAsOpened(notificationId, callBack);
  }
})

function getPostDiv(element) {
  const isRoot = element.classList.contains("post");
  const rootElement = isRoot ? element : element.closest(".post");
  return rootElement;
}

function getPostIdFromElement(element) {
    const isRoot = element.classList.contains("post");
    const rootElement = isRoot ? element : element.closest(".post");
    const postId = rootElement.getAttribute('data-id'); 
    if(postId === undefined) return alert('post id is undefined : function getPostIdFromElement');
    return postId;
}

// Handle creating post in html
function createPostsHtml(response, largeFont= false) {
  if(response == null) return alert("post object is null");

  const postedBy = response.postedBy;

  if(postedBy._id === undefined) {
    return console.log("User object not populated");
  }
  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timeStamp = timeDifference(new Date(), new Date(response.createdAt));
  const userId = userLoggedIn._id;

  const isRetweet = response.retweetData !== undefined;
  const retweetedBy = isRetweet ? response.postedBy.username : null;
  response = isRetweet ? response.retweetData : response;
  let retweetText = '';
  if(isRetweet) {
     retweetText = `<span>
                      <i class="fas fa-retweet"></i>
                      <a href='/profile/${retweetedBy}'>Retweeted by @${retweetedBy}</a>
                    </span>`
  }

  //checks if the user liked the post, so it renders the active class to the like element
  const likeButtonActiveClass = response.likes.includes(userId) ? "active" : "";
  const retweetButtonActiveClass = response.retweetUsers.includes(userId)? "active" : "";
  const largeFontClass = largeFont ? "largeFont" : "";

  //checks if its a reply to a post
  let replyFlag = "";
  if(response.replyTo && response.replyTo._id) {

    // those 2 if statements are for developement purposes
    if(!response.replyTo._id) alert('reply to data is not populated');
    if(!response.replyTo.postedBy._id) alert('postedBy is not populated');

    const replyToUsername = response.replyTo.postedBy.username;
    replyFlag = `<div class="replyFlag">
                    Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
                 </div>`
  }

  let buttons = "";
  let pinnedPostText = "";
  if(response.postedBy._id === userLoggedIn._id) {
    
    let pinnedClass = "";
    let dataTarget = "#confirmPinModal";
    if(response.pinned === true) {
      pinnedClass = "active";
      dataTarget = "#unpinModal"
      pinnedPostText = `<i class="fas fa-thumbtack"></i> <span>Pinned post</span>`;
    }

    buttons = `
              <button class="pinButton ${pinnedClass}" data-id=${response._id} data-bs-toggle="modal" data-bs-target=${dataTarget}>
              <i class="fas fa-thumbtack"></i>
              </button> 
              <button class="Xbutton" data-id=${response._id} data-bs-toggle="modal" data-bs-target="#deletePostModal">
                <i class="fas fa-times"></i>
              </button>`
  }

  return `
    <div class="post ${largeFontClass}" data-id=${response._id}>
      <div class = "postActionContainer">
        ${retweetText}
      </div> 
      <div class="mainContentContainer">
        <div class="userImageContainer">
          <img src="${postedBy.profilePic}">
        </div>
        <div class="postContentContainer">
          <div class="pinnedPostText">${pinnedPostText}</div>
          <div class="header">
            <a class="fullName" href="/profile/${postedBy.username}">${displayName}</a>
            <span class="username">@${postedBy.username}</span>
            <span class="date">${timeStamp}</span>
            ${buttons}
          </div>
          ${replyFlag}
          <div class="postBody">
            <span>${response.content}</span>
          </div>
          <div class="postFotter">
            <div class="postButtonContainer">
               <button class="commentButton" data-bs-toggle="modal" data-bs-target="#replyModal"">
                 <i class="far fa-comment-dots"></i>
               </button> 
            </div>
            <div class="postButtonContainer green">
               <button class="retweetButton ${retweetButtonActiveClass}">
                 <i class="fas fa-retweet"></i>
                 <span>${response.retweetUsers.length || ""}</span>
               </button> 
            </div>
            <div class="postButtonContainer red">
               <button class="likeButton ${likeButtonActiveClass}">
                 <i class="far fa-heart"></i>
                 <span>${response.likes.length || ""}</span>
               </button> 
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}



function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if(elapsed/1000 < 30)   return "just now"; 
       return Math.round(elapsed/1000) + ' seconds ago';   
  }

  else if (elapsed < msPerHour) {
       return Math.round(elapsed/msPerMinute) + ' minutes ago';   
  }

  else if (elapsed < msPerDay ) {
       return Math.round(elapsed/msPerHour ) + ' hours ago';   
  }

  else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + ' days ago';   
  }

  else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + ' months ago';   
  }

  else {
      return Math.round(elapsed/msPerYear ) + ' years ago';   
  }
}


function outPutPosts(results, container) {
  container.innerHTML = "";

  if(!Array.isArray(results)) {
    results = [results];
  }

  if(results.length === 0) {
    const emptyMessage = "<span class='noPosts'>Nothing To show</span>";
    return container.insertAdjacentHTML("afterbegin", emptyMessage);
  }
  results.forEach((result) => {
    const html = createPostsHtml(result);
    container.insertAdjacentHTML("afterbegin", html);
  })
}


function outPutPostsWithReplies(results, container) {
  container.innerHtml = "";

  if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostsHtml(results.replyTo, false);

    container.innerHTML += html;
  }

  const mainPostHtml = createPostsHtml(results.postData, true);
  container.innerHTML += mainPostHtml;


  results.replies.forEach((result) => {
    const html = createPostsHtml(result, false);
    container.innerHTML += html
  })
}

function outPutUsers(results, container) {
  container.innerHTML = "";
  if(results.length === 0) {
    return container.innerHTML = `<span class="noPosts">No results found</span>`;
  }
  results.forEach(result => {
      let html =  createUserHtml(result, true);
      container.insertAdjacentHTML("afterbegin", html);
  });
}

function createUserHtml(userData, showFollowButton) {
  let followButton = "";
  let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  let text = isFollowing ? "Following" : "Follow";
  let buttonClass = isFollowing ? "followButton following" : "followButton";
  if(showFollowButton && userLoggedIn._id !== userData._id) {
    followButton = `<div class="followButtonContainer">
                      <button class='${buttonClass}' data-user='${userData._id}'>${text}<button>
                    </div>`;
  }
  return `
    <div class="user">
        <div class="userImageContainer">
          <img src="${userData.profilePic}"/>
        </div>
        <div class="userDetailsContainer">
          <div class="header">
            <a href="/profile/${userData.username}">${userData.firstName} ${userData.lastName}</a>
            <span class="username">@${userData.username}</span>
          </div> 
        </div>
        ${followButton}
    </div>
  `;
}

async function searchUsers(searchTerm) {
  const postData = await fetch( "/api/users?" + new URLSearchParams({search: searchTerm}));
  const response = await postData.json();
  const resultsContainer = document.querySelector('.resultsContainer');
  outputSelectableUsers(response, resultsContainer); 
}

function outputSelectableUsers(results, container) {
  container.innerHTML = "";
  if(results.length === 0) {
    return container.innerHTML = `<span class="noPosts">No results found</span>`;
  }
  results.forEach(result => {
      if(userLoggedIn._id === result._id || selectedUsers.some(u=> u._id === result._id)) {
        return;
      }
      let html =  createUserHtmlChat(result, true);
      container.insertAdjacentHTML("afterbegin", html);
  });
}


// handle logic of adding to chat list
async function userSelected(userId) {
  const userData = await fetch(`/api/users/${userId}`);
  const user = await userData.json();
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  const userSearchTextBox = document.querySelector('#userSearchTextBox');
  const resultsContainer = document.querySelector('.resultsContainer');
  const createChatButton = document.querySelector('#createChatButton');
  userSearchTextBox.value = "";
  userSearchTextBox.focus();
  resultsContainer.innerHTML = "";
  createChatButton.disabled = false;
}




// handle add to chat list click
document.addEventListener('click', (e) => {
  if(e.target.classList.contains('addToListButton')) {
    let userId = e.target.getAttribute('data-user');
    userSelected(userId);
  }
})


function createUserHtmlChat(userData, showFollowButton) {
  let followButton = "";
  let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
  let text = isFollowing ? "Following" : "Follow";
  let buttonClass = isFollowing ? "followButton following" : "followButton";
  if(showFollowButton && userLoggedIn._id !== userData._id) {
    followButton = `<div class="followButtonContainer">
                      <button class='${buttonClass}' data-user='${userData._id}'>${text}<button>
                    </div>`;
  }
  return `
    <div class="user">
        <div class="userImageContainer">
          <img src="${userData.profilePic}"/>
        </div>
        <div class="userDetailsContainer">
          <div class="header">
            <a href="/profile/${userData.username}">${userData.firstName} ${userData.lastName}</a>
            <span class="username">@${userData.username}</span>
          </div> 
        </div>
        <div class="followButtonContainer">
          <button class='addToListButton' data-user='${userData._id}'>Add to chat list<button>
        </div>
    </div>
  `;
}

function updateSelectedUsersHtml() {
  let elements = [];
  selectedUsers.forEach((user) => {
    let name = `${user.firstName} ${user.lastName}`;
    elements.push(`<span class="selectedUser">${name}</span>`)
  })
  $('.selectedUser').remove();
  document.querySelector('#selectedUsers').insertAdjacentHTML("afterbegin", elements.join(""));
}



function stringToHTML(str) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
	return doc.body;
};

async function messageRecieved(newMessage) {
  if($('.chatContainer').length === 0) {
    // show popup notification
  }else {
    addChatMessageHtml(newMessage)
  }
  await refreshMessagesBadge();
}

async function markNotificationsAsOpened(notificationId = null, callBack = null) {
  if(callBack === null) callBack = () => location.reload();

  let url = notificationId !==null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
  const options = {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'}
  }
  const postData = await fetch(url, options);
  if(postData.status === 204) {
    callBack();
  }
}

async function refreshMessagesBadge() {
  const postData = await fetch('/api/chats?' + new URLSearchParams({unreadOnly: true}));
  const response = await postData.json();
  let numResults = response.length;
  if(numResults > 0) {
    const messagesBadge = document.querySelector('#messagesBadge');
    messagesBadge.textContent = numResults;
    messagesBadge.classList.add('active');
  }else {
    const messagesBadge = document.querySelector('#messagesBadge');
    messagesBadge.textContent = "";
    messagesBadge.classList.remove('active');
  }
}

async function refreshNotificationsBadge() {
  const postData = await fetch('/api/notifications?' + new URLSearchParams({unreadOnly: true}));
  const response = await postData.json();
  let numResults = response.length;

  if(numResults > 0) {
    const notificationBadge = document.querySelector('#notificationBadge');
    notificationBadge.textContent = numResults;
    notificationBadge.classList.add('active');
  }else {
    const notificationBadge = document.querySelector('#notificationBadge');
    notificationBadge.textContent = "";
    notificationBadge.classList.remove('active');
  }
}

function createChatHtml(chatData) {
  let chatName = getChatName(chatData); 
  let image = getChatImageElements(chatData); 
  let lastMessage =  getLatestMessage(chatData.latestMessage);
  let activeClass = !chatData.latestMessage ||  chatData.latestMessage.readBy.includes(userLoggedIn._id) ? ""  : "active";
  return `
    <a class="resultListItem  ${activeClass}" href='/messages/${chatData._id}' >
      <div class="resultsDetailsContainer">
        ${image}
        <span class="heading">${chatName}</span>
        <span class="subText">${lastMessage}</span>
      </div>
    </a>
  `
}