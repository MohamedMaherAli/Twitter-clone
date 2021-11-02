const resultsContainer = document.querySelector('.resultsContainer');
window.onload = async () => {
  const postData = await fetch("/api/notifications");
  const response = await postData.json();
  console.log(response);
  outputNotificationList(response, resultsContainer);
}

const markNotificationsAsRead = document.getElementById('markNotificationsAsRead');
markNotificationsAsRead.addEventListener('click', () => markNotificationsAsOpened())


function outputNotificationList(notifications, container) {
  if(notifications.length === 0) {
    return container.innherHTML = `<span class="noPosts">Nothing to show</span>`
  }
  notifications.forEach((not) => {
    let html = createNotificationHtml(not);
    container.insertAdjacentHTML("afterbegin", html);
  })
}

function createNotificationHtml(notification) {
  let userFrom = notification.userFrom;
  let text = getNotificationText(notification);
  let url = getNotificationURL(notification);
  let className = notification.opened ? "" : "active";
  return `
    <a href="${url}" class="resultListItem notification ${className}" data-id=${notification._id}>
      <div class="resultsImageContainer">
        <img src="${userFrom.profilePic}"/>
      </div>
      <div class="resultsDetailsContainer ellipsis">
        <span class="ellipsis">${text}</span>
      </div>
    </a>
  `
}

function getNotificationText(notification) {
  let userFrom = notification.userFrom;
  if(!userFrom.firstName || !userFrom.lastName) {
    return alert('userFrom data is not populated');
  }
  let userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  let text;
  if(notification.notificationType === "retweet") {
    text = `${userFromName} retweeted one of your posts`;
  }else if(notification.notificationType === "postLike") {
    text = `${userFromName} liked one of your posts`;
  }else if(notification.notificationType === "reply") {
    text = `${userFromName} replied to one of your posts`;
  }else if(notification.notificationType === "follow") {
    text = `${userFromName} followed you`;
  }

  return `<span class="ellipsis">${text}</span>`
}

function getNotificationURL(notification) {
  let url = "#";
  if(notification.notificationType === "retweet" ||
    notification.notificationType === "postLike" ||
    notification.notificationType === "reply") {
    url = `/posts/${notification.entityId}`;
  }else if(notification.notificationType === "follow") {
    url = `/profile/${notification.userFrom.username}`;
  }

  return url;
}

