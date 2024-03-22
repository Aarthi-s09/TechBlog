const mongoose = require('mongoose');
const express = require('express');
const { User } = require('./schema.js'); // Importing User model from schema.js
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors=require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())


async function connectToDb() {
    try {
        await mongoose.connect('mongodb+srv://Aarthis09:Aarthi1234@cluster0.kexotzh.mongodb.net/Techlife?retryWrites=true&w=majority&appName=Cluster00')
        console.log('DB Connection established')
        const port = process.env.PORT || 8002 // in cloud service take any port no which is avaliable(process.env.PORT) , in local machine it will take 8002 as port number
        app.listen(port, function () {
            console.log(`Listening on port ${port} `)
        })
    } catch (error) {
        console.log(error)
        console.log("Couldn't establish connection")
    }
}


connectToDb()


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Return some data if login successful
        res.json({ message: 'Login successful', user: { username: user.username } });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            username,
            password: hashedPassword
        });
        await newUser.save();

        // Return some data if signup successful
        res.json({ message: 'Signup successful', user: { username, email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
