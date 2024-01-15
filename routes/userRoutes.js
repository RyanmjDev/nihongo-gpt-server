const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;



const router = express.Router();

// Route for logging in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user in the database based on the email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log("password problems bro")
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token for authentication
    const token = generateToken(user);
    console.log("Successfully login!")
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.post('/demo', async (req, res) => {
  try {
    const demoEmail = `demo-${uuidv4()}@kaiwakun.com`;
    const hashedPassword = await bcrypt.hash("demo", saltRounds);
    const demoUser = new User({ name: "Demo User", email: demoEmail, password: hashedPassword, isDemo: true });
    await demoUser.save();
    const token = generateToken(demoUser);
    console.log("Demo user created and logged in!");
    res.json({ token });
  } catch (error) {
    console.error('Error creating Demo User:', error);
    res.status(500).json({ message: 'Error creating Demo User' });
  }
});


// Route for registering a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the name, email, and password are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user

    const newUser = new User({ name, email, password:hashedPassword });
    await newUser.save();

    // Generate a JWT token for authentication
    const token = generateToken(newUser);
    console.log("Successfully registered and logged in!");
    res.json({ token });
  } catch (error) {
    console.error('Error registering:', error);
    res.status(500).json({ message: 'Error registering' });
  }
});


module.exports = router;