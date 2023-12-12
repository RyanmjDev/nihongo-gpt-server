const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const ChatMessage = require('./models/ChatMessage');
const jwt = require('jsonwebtoken');
const chatRoutes = require('./routes/chatRoutes');

function generateToken(user) {
  const payload = {
    userId: user._id,
    email: user.email,
    // Add any additional data you want to include in the token payload
  };

  const options = {
    expiresIn: '1h', // Set the expiration time for the token
  };

  const secretKey = process.env.JWT_SECRET; // Replace with your own secret key

  return jwt.sign(payload, secretKey, options);
}



const axios = require('axios');
const User = require('./models/User');

require('dotenv').config();
app.use(express.json());
app.use(cors());

const initialPrompt = "You are a helpful assistant knowledgeable in teaching Japanese, sensei. You provide informative and accurate responses to questions about the Japanese language, culture, and learning resources. Keep Conversations to being about Japanese, or bring them back to Japanese as a topic at all times. Replies should always include some Japanese, and also English. Do answers questions not about Japanese, and instead redirect the conversation to Japanese using English and Japanese.";



const port = process.env.PORT || 3000;

//mongodb://127.0.0.1:27017/NihongoGPT

const mongoDBUri = 'mongodb://127.0.0.1:27017/NihongoGPT';


mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.get('/', (req, res) => {
  res.send('Hello, NihongoGPT!');
});


app.post('/', (req, res) => {
     const message = new ChatMessage({
        message: req.body.message,
        isUser: req.body.isUser,
     })
})

// Route for logging
app.post('/login', async (req, res) => {
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



app.use('/chat', chatRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
