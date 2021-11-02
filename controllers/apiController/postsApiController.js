const Post = require('../../models/postsSchema');
const User = require('../../models/userSchema');
const Notification = require('../../models/notificationSchema');
//get posts
exports.getApiPosts = async (req, res) => {

   let searchObject = req.query;

   if(searchObject.isReply !== undefined) {
      let isReply = searchObject.isReply === "true";
      searchObject.replyTo = {$exists: isReply};
      delete searchObject.isReply;
   }

   if(searchObject.search !== undefined) {
      searchObject.content = {$regex : searchObject.search, $options: "i"};
      delete searchObject.search;
   }

   if(searchObject.followingOnly !== undefined) {
      let objectIds =[];
      objectIds.push(...req.session.user.following);
      objectIds.push(req.session.user._id);
      searchObject.postedBy = {$in: objectIds};
      delete searchObject.followingOnly;
   }
   const results = await getPosts(searchObject)
   .catch(e => console.log(e));
   res.status(200).send(results); 
}

 
//Post posts
exports.postApiPosts = async (req, res) => {
   try {
      if(!req.body.content) {
         return res.status(400).send('Bad Request');
      }

      const postData = {
        content : req.body.content,
        postedBy : req.session.user
      }

      if(req.body.replyTo) {
         postData.replyTo = req.body.replyTo;
      }

      const post =  new Post(postData);
      await post.save();

      let populated = await User.populate(post, { path: "postedBy" });
      populated = await Post.populate(post, { path: "replyTo" });

      if(populated.replyTo !== undefined) {
         await Notification.insertNotification(populated.replyTo.postedBy, req.session.user._id, "reply", populated._id);
      }
      return res.status(201).json(populated);

    }catch(e) {

       console.log(e);
      return res.status(404).send(e);

   }
}

//PUT request for likes posts
exports.putApiPostsLikes = async (req, res) => {
   const user = req.session.user;
   const postId = req.params.id;
   const userId = user._id;

   // check if the userLiked the post
   const isLiked = user.likes && user.likes.includes(postId);

   // determine whether to like or dislike a post
   const option = isLiked ? "$pull" : "$addToSet";

   // inserting or deleting like from users schema
   req.session.user = await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new: true});

   // inserting or deleting likes from posts schema
   const post = await Post.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new: true});

   if(!isLiked) {
      await Notification.insertNotification(post.postedBy, userId, "postLike", post._id);
   }

   res.send(post);   
}


//Post request for retweet posts
exports.postApiPostsRetweet = async (req, res) => {
   const user = req.session.user;
   const postId = req.params.id;
   const userId = user._id;

   // check for retweet or undo retweet
   const isRetweeted = await Post.findOneAndDelete({postedBy: userId, retweetData: postId})

   const option = isRetweeted ? "$pull" : "$addToSet";

   var repost = isRetweeted;
   if(repost === null) {
      repost = await new Post({postedBy: userId, retweetData: postId});
      await repost.save();
   } 

   //updated the user in the session request
   req.session.user = await User.findOneAndUpdate(userId, {[option] : {retweets : repost._id}}, {new: true});

   //update the post retweetUsers
   const post = await Post.findOneAndUpdate(postId, {[option] : {retweetUsers: userId}}, {new: true});

   if(!isRetweeted) {
      await Notification.insertNotification(post.postedBy, userId, "retweet", post._id);
   }

   res.status(200).send(post);

}


//Get a single post 
exports.getApiSinglePost = async (req, res) => {
   const postId = req.params.id;   
   let postData = await getPosts({_id: postId});
   postData = postData[0];
   const results = {
      postData: postData
   }

   if(postData.replyTo !== undefined) {
      results.replyTo = postData.replyTo
   }


   results.replies = await getPosts({replyTo: postId});

   res.status(200).send(results);
}

//Get Post Page
exports.getApiPostPage = async (req, res) => {
   const payLoad = {
      pageTitle : "View Post",
      userLoggedIn: req.session.user,
      userLoggedInJs: JSON.stringify(req.session.user),
      postId:  req.params.id
   }
   res.status(200).render("postPage", payLoad);
}



//Deleting a post
exports.DeleteApiPost = async (req, res) => {
   const postId = req.params.id;
   await Post.findByIdAndDelete(postId);
   res.sendStatus(202);
}

//Pinning a post
exports.pinApiPost = async (req, res) => {
   if(req.body.pinned !== undefined) {
      await Post.updateMany({postedBy: req.session.user._id}, {pinned: false})
      .catch((e) => {
         console.log(e);
         res.sendStatus(400);
      });

      await Post.findByIdAndUpdate(req.params.id, req.body)
      .catch((e) => {
         console.log(e);
         res.sendStatus(400);
      });
   
      res.sendStatus(204);
   }      
}


async function getPosts(filter) {
   let results = await Post.find(filter)
   .populate("postedBy")
   .populate("retweetData")
   .populate("replyTo")
   .catch(e => console.log(e));

   results = await User.populate(results, {path: "replyTo.postedBy"});
   return await User.populate(results, {path: "retweetData.postedBy"});
}