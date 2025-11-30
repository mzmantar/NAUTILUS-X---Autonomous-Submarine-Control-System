const express = require("express");
const cors = require("cors");
const { naviguer, naviguerVersPoint, getEtatNavigation } = require("./navigation");

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Endpoint pour la navigation simple
app.post("/navigate", async (req, res) => {
  try {
    const { direction } = req.body;
    if (!direction) {
      return res.status(400).json({ error: "Direction requise" });
    }

    await naviguer(direction);
    res.json({ message: `Navigation ${direction} effectuée` });
  } catch (error) {
    console.error("[NAVIGATION-SVC] Erreur navigation:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour la navigation vers un point avec choix de l'algorithme
app.post("/navigate/to", async (req, res) => {
  try {
    const { latitude, longitude, algorithm = 'direct' } = req.body;
    
    // Validation des coordonnées
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ 
        error: "Coordonnées GPS invalides. latitude et longitude doivent être des nombres" 
      });
    }

    // Validation de l'algorithme
    const algorithmesValides = ['direct', 'spiral', 'astar'];
    if (!algorithmesValides.includes(algorithm)) {
      return res.status(400).json({ 
        error: `Algorithme non supporté. Valeurs valides: ${algorithmesValides.join(', ')}` 
      });
    }

    await naviguerVersPoint({ latitude, longitude }, algorithm);
    res.json({ 
      message: `Navigation vers (${latitude}, ${longitude}) avec l'algorithme ${algorithm}` 
    });
  } catch (error) {
    console.error("[NAVIGATION-SVC] Erreur navigation vers point:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour obtenir l'état de la navigation
app.get("/navigate/status", (req, res) => {
  try {
    const etat = getEtatNavigation();
    res.json(etat);
  } catch (error) {
    console.error("[NAVIGATION-SVC] Erreur lecture état:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`[NAVIGATION-SVC] Service démarré sur le port ${port}`);
});
