const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const {requireLogin} = require('../middleware/session-middlware');

//Get home page
router.get('/', requireLogin, indexController.getHomePage);




module.exports = router;