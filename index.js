const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const ChatMessage = require('./models/ChatMessage');
const jwt = require('jsonwebtoken');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

const axios = require('axios');
const User = require('./models/User');

require('dotenv').config();
app.use(express.json());
app.use(cors());



const port = process.env.PORT || 3000;


const mongoDBUri = 'mongodb://127.0.0.1:27017/NihongoGPT';


mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.get('/', (req, res) => {
  res.send('Hello, NihongoGPT!');
});


// app.post('/', (req, res) => {
//      const message = new ChatMessage({
//         message: req.body.message,
//         isUser: req.body.isUser,
//      })
// })


app.use('/users', userRoutes);
app.use('/chat', chatRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
