const User = require('../models/userSchema');
const Post = require('../models/postsSchema');
const path = require('path');
const fs = require('fs');
exports.getProfilePage = (req, res) => {
  const payLoad = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user
  }

  res.status(200).render('profilePage', payLoad);
}

exports.getProfilePageByUsername = async (req, res) => {
  const username = req.params.username;
  const userLoggedIn = req.session.user;
  const payLoad = await getPayLoad(username, userLoggedIn);
  res.status(200).render('profilePage', payLoad);
}


exports.getProfileUserReplies = async (req, res) => {
  const username = req.params.username;
  const userLoggedIn = req.session.user;
  const payLoad = await getPayLoad(username, userLoggedIn);
  payLoad.selectedTab = 'replies';
  res.status(200).render('profilePage', payLoad);
}

exports.getProfileUserFollowing = async (req, res) => {
  const username = req.params.username;
  const userLoggedIn = req.session.user;
  const payLoad = await getPayLoad(username, userLoggedIn);
  payLoad.selectedTab = 'following';
  res.status(200).render('followersAndFollowing', payLoad);
}

exports.getProfileUserFollowers = async (req, res) => {
  const username = req.params.username;
  const userLoggedIn = req.session.user;
  const payLoad = await getPayLoad(username, userLoggedIn);
  payLoad.selectedTab = 'followers';
  res.status(200).render('followersAndFollowing', payLoad);
}

exports.postProfileImageUpload = async (req, res) => {
  if(!req.file) {
    console.log('No file uploaded with the request');
    return res.sendStatus(400);
  }
  let filePath = `/uploads/images/${req.file.filename}.png`;
  let tempPath = req.file.path;
  let targetPath = path.join(__dirname, `../${filePath}`);
  fs.rename(tempPath, targetPath, async (e) => {
    if(e) {
      console.log(e);
      res.sendStatus(400);
    }
    const userId = req.session.user._id;
    req.session.user = await User.findByIdAndUpdate(userId, {profilePic: filePath}, {new: true});
    res.sendStatus(204);
  });
}

exports.getProfilePageImage = async (req, res)=> {
   res.sendFile(path.join(__dirname, `../uploads/images/${req.params.path}`));
}

exports.postProfileCoverPhoto = async(req, res) => {
  if(!req.file) {
    console.log('No file uploaded with the request');
    return res.sendStatus(400);
  }
  let filePath = `/uploads/images/${req.file.filename}.jpg`;
  let tempPath = req.file.path;
  let targetPath = path.join(__dirname, `../${filePath}`);
  fs.rename(tempPath, targetPath, async (e) => {
    if(e) {
      console.log(e);
      res.sendStatus(400);
    }
    const userId = req.session.user._id;
    req.session.user = await User.findByIdAndUpdate(userId, {coverPhoto: filePath}, {new: true});
    res.sendStatus(204);
  });
}

async function getPayLoad(username, userLoggedIn) {
  let user = await User.findOne({username: username});
  if(!user) {
    const payLoad = {
      pageTitle: "User not found",
      userLoggedIn: userLoggedIn,
      userLoggedInJs: JSON.stringify(userLoggedIn)
    }
    return payLoad;
  }

  const payLoad = {
    pageTitle: user.username,
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user
  }
  return payLoad;
}

