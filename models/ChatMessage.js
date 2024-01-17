const mongoose = require('mongoose')

const ChatMessageSchema = new mongoose.Schema({
    message: String,
    isUser: Boolean,
    createdAt: { 
        type: Date, 
        default: Date.now, 
    },
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);