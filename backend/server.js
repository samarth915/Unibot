// backend/server.js
const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 8000;

app.use(cors()); // Allow frontend to communicate
app.use(express.json()); // Enable JSON body parsing

// API endpoint to handle chat requests
app.post("/api/chat", (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: "No message provided." });
  }

  // Run the Python chatbot script with the message
  const command = `python -X utf8 chatbot.py "${userMessage}"`;

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error("Python Error:", stderr);
      return res.status(500).json({ reply: "Internal server error." });
    }

    return res.json({ reply: stdout.trim() });
  });
});

// Start the Node server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
