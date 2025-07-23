const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const mongoURI = 'mongodb+srv://frzzz25:00000000@cluster0.gsmmtau.mongodb.net/esp32_logs?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

const logSchema = new mongoose.Schema({
    type: String,
    value: String,
    timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

let ledStates = {
    blue: false,
    white: false,
    green: false
};

let irStatus = "LOW";

app.get('/led-states', (req, res) => {
    res.json(ledStates);
});

app.post('/led', async (req, res) => {
    const { color, state } = req.body;
    if (!['blue', 'white', 'green'].includes(color)) {
        return res.status(400).json({ error: 'Invalid color' });
    }

    ledStates[color] = state === 'on';

    await Log.create({ type: 'LED', value: `${color.toUpperCase()} ${state.toUpperCase()}` });

    res.json({ success: true });
});

app.post('/ir', async (req, res) => {
    const { status } = req.body;
    irStatus = status;
    await Log.create({ type: 'IR', value: status });
    res.json({ success: true });
});

app.get('/logs', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
