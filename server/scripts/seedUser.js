const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doc-analyzer';
console.log('Connecting to MongoDB at:', mongoUri);

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB Connected for seeding'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const seedUser = async () => {
    try {
        const email = 'test@test.com';
        const password = 'test@123'; // This will be hashed by the User model pre-save hook
        const name = 'Test User';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log(`User ${email} already exists.`);
            // Update password just in case
            user.password = password;
            await user.save();
            console.log(`Password updated for ${email}`);
        } else {
            // Create user
            await User.create({ name, email, password });
            console.log(`User ${email} created successfully`);
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
