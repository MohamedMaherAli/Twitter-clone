const Chat = require('../../models/chatSchema');
const User = require('../../models/userSchema');
const Message = require('../../models/messageSchema');


exports.postChatData = async (req, res) => {
  if(!req.body) {
    console.log('No users were sent with the request body');
    return res.sendStatus(400);
  }
  const users = req.body;
  if(users.length === 0) {
    console.log('Users array is empty');
    return res.sendStatus(400);
  }
  users.push(req.session.user);
  let chatData = {
    users: users,
    isGroupChat: true
  }
  const chat = new Chat(chatData);
  await chat.save().catch((e) => {
    console.log(e);
    return res.sendStatus(400);
  });
  res.status(201).send(chat);
}

exports.getChatData = async (req, res) => {
  const user = req.session.user;
   Chat.find({users: { $elemMatch: {$eq : user._id} }})
  .populate("users")
  .populate("latestMessage")
  .sort({updatedAt: 1})
  .then(async (results) => {
    if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
       results = results.filter(r => r.latestMEssage && !r.latestMessage.readBy.includes(req.session.user._id)); 
    }
    results = await User.populate(results, {path: "latestMessage.sender"});
    res.status(200).send(results);
  })
  .catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });
}

exports.getChatMessages = async(req, res) => {
  const chatId = req.params.chatId;
  const messages = await Message.find({chat: chatId}).populate("sender");
  res.status(200).send(messages);
}

exports.putMessagesAsRead = async(req, res) => {
  await Message.updateMany({chat: req.params.chatId}, {$addToSet: {readBy: req.session.user._id}})
  .catch(e => {
    console.log(e);
    res.sendStatus(400);
  });
  res.sendStatus(204);
}