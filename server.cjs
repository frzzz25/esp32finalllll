const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new MongoClient(process.env.MONGO_URI);
const dbName = "esp32_logs";
const collectionName = "logs";

app.post("/log", async (req, res) => {
  const { type, value } = req.body;
  const timestamp = new Date().toISOString();
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.collection(collectionName).insertOne({ type, value, timestamp });
    res.status(200).send("Logged");
  } catch (err) {
    res.status(500).send("Error logging to DB");
  }
});

app.get("/history", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const logs = await db.collection(collectionName).find().sort({ timestamp: -1 }).limit(50).toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).send("Error fetching logs");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
