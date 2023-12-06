const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/NihongoGPT', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        // Delete all existing users
        User.deleteMany({})
            .then(() => {
                console.log('Old entries deleted successfully');

                // Define an array of user objects
                const users = [
                    { name: 'John Smith', email: 'user1@ngpt.com', password: 'password1' },
                    { name: 'Jane Smith', email: 'user2@ngpt.com', password: 'password2' },
                    { name: 'Bob Smith', email: 'user3@ngpt.com', password: 'password3' },
                ];

                // Hash passwords and insert the users into the database
                Promise.all(users.map(async (user) => {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(user.password, salt);
                    return { ...user, password: hashedPassword };
                }))
                    .then((hashedUsers) => {
                        User.insertMany(hashedUsers)
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
                        console.error('Error hashing passwords:', error);
                        mongoose.disconnect();
                    });
            })
            .catch((error) => {
                console.error('Error deleting old entries:', error);
                mongoose.disconnect();
            });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
