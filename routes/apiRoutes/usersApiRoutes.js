const express = require('express');
const router = express.Router();
const {requireLogin} = require('../../middleware/session-middlware');
const userApiController = require('../../controllers/apiController/usersApiController');

//Handle user follow request
router.put('/api/users/:id/follow', requireLogin, userApiController.putFollowUser);

//get followers page
router.get('/api/users/:id/followers', requireLogin, userApiController.getFollowers);


//get following page
router.get('/api/users/:id/following', requireLogin, userApiController.getFollowing);

//get users
router.get('/api/users', requireLogin, userApiController.getUsers);

//get user by id
router.get('/api/users/:id', requireLogin, userApiController.getUserById);

module.exports = router;
