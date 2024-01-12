const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/quantumit', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User model
const User = mongoose.model('User', {
    name:String,
    dob:Date,
    email: String,
    password: String,
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name,dob,email, password } = req.body;

  // Check if username already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({ name,dob,email,password: hashedPassword });
  await newUser.save();

  res.json({ message: 'Registration successful' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate a token
  const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
