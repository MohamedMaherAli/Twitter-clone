const express = require('express');
const router = express.Router();
const postsApiController = require('../controllers/apiController/postsApiController');
const { requireLogin } = require('../middleware/session-middlware');

//Get post page by id to show the post page and comments
router.get('/posts/:id', requireLogin, postsApiController.getApiPostPage);



module.exports = router