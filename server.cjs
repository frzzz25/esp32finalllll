const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// === MongoDB Connection ===
const mongoURI = 'mongodb+srv://frzzz25:00000000@cluster0.2jeesoj.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'esp32_logs';
let db;

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('✅ Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(error => console.error('❌ MongoDB connection failed:', error));

app.use(cors());
app.use(bodyParser.json());

// === Serve HTML from 'public' folder ===
app.use(express.static(path.join(__dirname, 'public')));

// === API ENDPOINTS ===

// Receive LED state updates from ESP32
app.post('/api/led', async (req, res) => {
  const { color, state } = req.body;
  const time = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

  try {
    const collection = db.collection('led_logs');
    await collection.insertOne({ color, state, time });
    res.status(200).send('LED log saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving LED log');
  }
});

// Receive IR sensor data from ESP32
app.post('/api/ir', async (req, res) => {
  const { value } = req.body;
  const time = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

  try {
    const collection = db.collection('ir_logs');
    await collection.insertOne({ value, time });
    res.status(200).send('IR log saved');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving IR log');
  }
});

// Get logs (for frontend display)
app.get('/api/logs', async (req, res) => {
  try {
    const ledLogs = await db.collection('led_logs').find().sort({ _id: -1 }).toArray();
    const irLogs = await db.collection('ir_logs').find().sort({ _id: -1 }).toArray();
    res.json({ ledLogs, irLogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to retrieve logs');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
