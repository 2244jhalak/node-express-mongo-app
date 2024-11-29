require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Setup
const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('testdb'); // Replace 'testdb' with your database name
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

// Helper to get the database instance
function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

// API Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await getDB().collection('users').find().toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;
    const result = await getDB().collection('users').insertOne(newUser);
    const insertedUser = await getDB().collection('users').findOne({ _id: result.insertedId });
    res.status(201).json(insertedUser);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Start Server
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
})();
