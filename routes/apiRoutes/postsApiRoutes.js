const express = require('express');
const router = express.Router();
const postsController = require('../../controllers/apiController/postsApiController');
const { requireLogin } = require('../../middleware/session-middlware');

//get request posts
router.get('/api/posts', requireLogin, postsController.getApiPosts);

//post request posts
router.post('/api/posts', requireLogin, postsController.postApiPosts);

//PUT request posts likes
router.put('/api/posts/:id/like', requireLogin, postsController.putApiPostsLikes);

//Post request posts retweets
router.post('/api/posts/:id/retweet', requireLogin, postsController.postApiPostsRetweet);

//Get request to get a single post For Modal 
router.get('/api/posts/:id', requireLogin, postsController.getApiSinglePost);

//Delete post 
router.delete('/api/posts/:id', requireLogin, postsController.DeleteApiPost);

//Pin post
router.put('/api/posts/:id', requireLogin, postsController.pinApiPost);


module.exports = router;