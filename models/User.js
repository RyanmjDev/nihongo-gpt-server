
const mongoose = require('mongoose');
const ChatMessage = require('./ChatMessage')

const Schema = mongoose.Schema;


// Define the User model schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  chatMessages: [{
    type: Schema.Types.ObjectId,
    ref: 'ChatMessage'
  }]
});

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
