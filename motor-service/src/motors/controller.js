const { envoyerCommande } = require("../serial/arduino");

const commandesValides = [
  "F",
  "B",
  "L",
  "R",
  "S",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "q",
];

function envoyerCommandeMoteur(cmd) {
  if (!commandesValides.includes(cmd)) {
    throw new Error(`Commande invalide : ${cmd}`);
  }

  envoyerCommande(cmd);
}

module.exports = { envoyerCommandeMoteur };
