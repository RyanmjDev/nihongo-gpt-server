const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for logging in
router.post('/login', userController.login);

// Route for creating a demo user
router.post('/demo', userController.createDemo);

// Route for registering a new user
router.post('/register', userController.register);


module.exports = router;