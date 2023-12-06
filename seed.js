
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/NihongoGPT', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Define an array of user objects
    const users = [
      { name: 'John Smith', email: 'user1@ngpt.com', password: 'password1' },
      { name: 'Jane Smith', email: 'user2@ngpt.com', password: 'password2' },
      { name: 'Bob Smith', email: 'user3@ngpt.com', password: 'password3' },
    ];
    
    // Insert the users into the database
    User.insertMany(users)
      .then(() => {
        console.log('Users seeded successfully');
        mongoose.disconnect();
      })
      .catch((error) => {
        console.error('Error seeding users:', error);
        mongoose.disconnect();
      });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
