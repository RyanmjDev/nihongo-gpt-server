const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ChatMessage = require('./ChatMessage');

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

// Compare the provided password with the stored password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
