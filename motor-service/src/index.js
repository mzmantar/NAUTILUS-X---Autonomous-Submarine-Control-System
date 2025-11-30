const express = require("express");
const { initSerial } = require("./serial/arduino");
const { envoyerCommandeMoteur } = require("./motors/controller");

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());

app.post("/motors/command", (req, res) => {
  const { cmd } = req.body;

  if (!cmd) {
    return res.status(400).json({ error: "Aucune commande reçue" });
  }

  try {
    envoyerCommandeMoteur(cmd);
    res.json({ status: "ok", sent: cmd });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

initSerial();

app.listen(PORT, () => {
  console.log(`[Motors Service] Écoute sur le port ${PORT}`);
});
