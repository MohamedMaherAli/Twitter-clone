const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/userController');

// Register Page
router.get('/register', userController.getRegisterPage);


// Handle Register
router.post('/register',[
   body('email')
      .trim().isEmail().normalizeEmail().toLowerCase().withMessage('Email must be a valid email'),
   body('password')
      .trim().isLength({min : 4}).withMessage('password must be more than 4 characters'),
   body('firstName')
      .trim().isLength({min : 2}).withMessage('First name field must be at least 2 characters'),
   body('lastName')
      .trim().isLength({min : 2}).withMessage('Last name field must be at least 2 characters')     
], userController.postRegisterPage);



// Login Page
router.get('/login', userController.getLoginPage);

// Handle Login Page
router.post('/login',[
   body('email')
   .trim(),
   body('password')
      .trim()
] ,userController.postLoginPage);


// Handle logout
router.get('/logout', userController.getLogout);


module.exports = router;

