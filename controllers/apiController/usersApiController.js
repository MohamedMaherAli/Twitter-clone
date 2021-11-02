const User = require('../../models/userSchema');
const Post = require('../../models/postsSchema');
const Notification = require('../../models/notificationSchema');

exports.putFollowUser = async (req, res) => {
  const userId = req.params.id;  
  let user =  await User.findById(userId);
  if(!user) return res.sendStatus(404);
  const isFollowing = user.followers && user.followers.includes(req.session.user._id);
  const option = isFollowing ? "$pull" : "$addToSet";
  await User.findByIdAndUpdate(userId, {[option] : {followers : req.session.user._id} })
  .catch((e) => {
    console.log(e);
    res.sendStatus(400);
  });
  req.session.user = await User.findByIdAndUpdate(req.session.user._id, {[option] : {following: userId}},{new: true})
  .catch((e) => {
    console.log(e);
    res.sendStatus(400)
  }); 

  //inserting a notification
  if(!isFollowing) {
    await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
  }
  res.status(200).send(req.session.user);
}

exports.getFollowers = async(req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("followers");
  if(!user) {
    return res.sendStatus(400);
  }
  res.status(200).send(user);
}

exports.getFollowing = async(req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("following");
  if(!user) {
    return res.sendStatus(400);
  }
  res.status(200).send(user);
}

exports.getUsers = async (req, res) => {
  let searchObject = req.query;
  if(searchObject.search !== undefined) {
    searchObject = {
      $or: [
        {firstName: {$regex : searchObject.search, $options: "i"}},
        {lastName: {$regex : searchObject.search, $options: "i"}},
        {username: {$regex : searchObject.search, $options: "i"}}
      ]
    }
    const users = await User.find(searchObject)
                    .catch((e) =>{
                      console.log(e);
                      res.sendStatus(400);
                    });
    res.status(200).send(users);                
  }
}

exports.getUserById = async(req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  res.status(200).send(user);
}