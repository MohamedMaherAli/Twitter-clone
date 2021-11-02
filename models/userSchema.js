const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  firstName : {
    type : String,
    trim : true,
    required: true
  },
  lastName : {
    type : String,
    trim : true,
    required : true
  },
  username : {
    type : String,
    trime : true,
    required : true,
    unique : true
  },
  email : {
    type : String,
    trim : true,
    required : true,
    unique : true
  },
  password : {
    type : String,
    trim : true,
    required : true
  },
  profilePic : {
    type : String,
    default : "/images/defaultProfilePic.jpg"
  },
  coverPhoto : {
    type : String
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref : 'Post' 
    }
  ],
  retweets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, {timestamps: true})

const User = mongoose.model('User', UserSchema);

module.exports = User;