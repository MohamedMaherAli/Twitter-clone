let connected = false;

let socket = io('http://localhost:3000');
// connection to server
socket.emit("event", userLoggedIn);
socket.on("connected", () => connected = true);
socket.on("message recieved", (newMessage) => {
  messageRecieved(newMessage);
});

socket.on("notification received", async (newNotification) => {
  const postData = await fetch('/api/notifications/latest');
  const respose = await postData.json();
  refreshNotificationsBadge();
})

function emitNotification(userId) {
  if(userId === userLoggedIn._id)  return;
  socket.emit("notification received", userId);
}