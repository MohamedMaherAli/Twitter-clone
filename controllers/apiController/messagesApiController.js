const Message = require('../../models/messageSchema');
const Chat = require('../../models/chatSchema');
const User = require('../../models/userSchema');

exports.postMessage = async (req, res) => {
  if(!req.body) {
    console.log("Invalid input passed into the request");
    return res.sendStatus(400);
  }
  const {content, chatId} = req.body;
  const newMessage = {
    content: content,
    chat: chatId,
    sender: req.session.user._id
  }
  const message = new Message(newMessage);
  await message.save().catch(e => {
    console.log(e);
    return res.sendStatus(400);
  });
  let populatedMessage = await Message.findById(message._id).populate("sender").populate("chat");
  populatedMessage = await User.populate(populatedMessage, {path: "chat.users"});
  await Chat.findByIdAndUpdate(chatId, {latestMessage: populatedMessage._id}).catch(e => console.log(e)); 

  res.status(201).send(populatedMessage);
}