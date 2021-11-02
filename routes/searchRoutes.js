const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/session-middlware');
const searchController = require('../controllers/searchController');

router.get('/search', requireLogin, searchController.getSearchPage);


router.get('/search/:selectedTab', requireLogin, searchController.getSelectedTab);





module.exports = router;