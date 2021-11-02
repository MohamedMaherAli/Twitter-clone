const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT;
const databaseConnection = require('./connection');
const session = require('express-session');




const server = app.listen(port, () => { console.log(`app listening at port: ${port}`); });
const io = require('socket.io')(server, {pingTimout: 60000});




app.set("view engine", "pug");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'secretWord',
    resave: true,
    saveUninitialized: false
  })
);


//Routes
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoues = require('./routes/profileRoutes');
const searchRoutes = require('./routes/searchRoutes')
const messagesRoutes = require('./routes/messagesRoutes');
const postsApiRoutes = require('./routes/apiRoutes/postsApiRoutes');
const usersApiRoutes = require('./routes/apiRoutes/usersApiRoutes');
const chatsApiRoutes = require('./routes/apiRoutes/chatsApiRoutes');
const messagesApiRoutes = require('./routes/apiRoutes/messagesApiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationApiRoutes = require('./routes/apiRoutes/notificationsApiRoutes')

app.use(indexRoutes);
app.use(userRoutes);
app.use(postRoutes);
app.use(profileRoues);
app.use(searchRoutes);
app.use(messagesRoutes);
app.use(postsApiRoutes);
app.use(usersApiRoutes);
app.use(chatsApiRoutes);
app.use(messagesApiRoutes);
app.use(notificationRoutes);
app.use(notificationApiRoutes);




io.on('connection', socket => {
  //connection to client
  socket.on("event", (userData) => {
    socket.join(userData._id);
    socket.emit("connected"); 
  })

  //joining room  
  socket.on("join room", room => socket.join(room));
  socket.on("typing", room => socket.in(room).emit("typing"));
  socket.on("stop typing", room => socket.in(room).emit("stop typing"));
  socket.on("notification received", room => socket.in(room).emit("notification received"));


  socket.on("new message", newMessage => {
    let chat = newMessage.chat;
    if(!chat.users) return console.log("chat.users is not defined");
    chat.users.forEach((user) => {
      if(user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessage);
    })
    
  });
})