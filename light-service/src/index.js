const express = require("express");
const { sendLightCommand } = require("./serial");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3006;

app.post("/light", (req, res) => {
  const { action } = req.body;
  const validCommands = ["ON", "OFF", "LOW", "MED", "HIGH"];

  if (!validCommands.includes(action)) {
    return res.status(400).json({ error: "Commande invalide" });
  }

  sendLightCommand(action);
  res.json({ status: "Commande lumière envoyée", action });
});

app.listen(PORT, () => {
  console.log(`Light service running on port ${PORT}`);
});
