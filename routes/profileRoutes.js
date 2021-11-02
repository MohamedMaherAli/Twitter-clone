const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/session-middlware');
const profileController = require('../controllers/profileController');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

//Get profile page
router.get('/profile', requireLogin, profileController.getProfilePage);

//Get profile by username
router.get('/profile/:username', requireLogin, profileController.getProfilePageByUsername);


//Get user replies on profile page
router.get('/profile/:username/replies', requireLogin, profileController.getProfileUserReplies);


//Get following page
router.get('/profile/:username/following', requireLogin, profileController.getProfileUserFollowing);

//Get followers page
router.get('/profile/:username/followers', requireLogin, profileController.getProfileUserFollowers);

// handle image upload
router.post('/api/users/profilePicture', requireLogin, upload.single('croppedImage'),profileController.postProfileImageUpload);


router.get('/uploads/images/:path',profileController.getProfilePage);

//handle cover upload
router.post('/api/users/coverPhoto', requireLogin, upload.single('croppedImage'), profileController.postProfileCoverPhoto);


module.exports = router;