const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const ChatMessage = require('./models/ChatMessage');


const port = process.env.PORT || 3000;

//mongodb://127.0.0.1:27017/NihongoGPT

const mongoDBUri = 'mongodb://127.0.0.1:27017/NihongoGPT';


mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.get('/', (req, res) => {
  res.send('Hello, NihongoGPT!');
});

app.get('/messages', async(req, res) => {
    try {
        const messages = await ChatMessage.find();
        res.json(messages)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

app.post('/', (req, res) => {
     const message = new ChatMessage({
        message: req.body.message,
        isUser: req.body.isUser,
     })
})

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
