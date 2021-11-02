const Chat = require('../models/chatSchema');
const User = require('../models/userSchema');
const mongoose = require('mongoose');

exports.getMessagePage = (req, res) => {
  res.render('inboxPage', {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  });
}


exports.getNewMessagePage = (req, res) => {
  res.render('newMessage', {
    pageTitle: "New message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  });
}

exports.getChatPage = async (req, res) => {
  const userId = req.session.user._id;
  const chatId = req.params.id;
  const isValidObjectId = mongoose.isValidObjectId(chatId);

  let payLoad = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  };

  if(!isValidObjectId) {
    payLoad.errorMessage = "Chat doesn't exist, or you do not have permission to view it";
    return res.render('chatPage', payLoad);
  }
  // searching for both userId and chatId, so a user cannot acess a chat he is not part in it.
  let chat = await Chat.findOne({_id: chatId, users: {$elemMatch : {$eq: userId}}}).populate("users");
  if(chat === null) {
     let userFound = await User.findById(chatId);
    if(userFound !== null) {
      // get chat using userId;
      chat = await getChatByUserId(userFound._id, userId)
    }
  }
  if(chat === null) {
    payLoad.errorMessage = "Chat doesn't exist, or you do not have permission to view it";
  }else {
    payLoad.chat = chat;
   
  }
   res.status(200).render('chatPage', payLoad);
}

async function getChatByUserId(userLoggedInId, otherUserId) {
  return await Chat.findOneAndUpdate({isGroupChat: false,
    users: {
      $size: 2,
      $all: [
        {$elemMatch : {$eq : mongoose.Types.ObjectId(userLoggedInId)}},
        {$elemMatch : {$eq: mongoose.Types.ObjectId(otherUserId)}}
      ] 
    }
  }, 
  {
    $setOnInsert: {
      users: [userLoggedInId, otherUserId]
    }
  }, {
    new: true,
    upsert: true
  })
  .populate("users");
}