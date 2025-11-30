const { SerialPort } = require("serialport");

let port;

function initSerial() {
  port = new SerialPort({
    path: "/dev/ttyUSB0",
    baudRate: 115200,
  });

  port.on("open", () => console.log("[Serial] Port série ouvert"));
  port.on("error", (err) => console.error("[Serial] Erreur:", err.message));
  port.on("data", (data) => {
    console.log("[Arduino]", data.toString());
  });
}

function envoyerCommande(cmd) {
  if (port && port.writable) {
    port.write(cmd, (err) => {
      if (err) {
        console.error("[Serial] Erreur d'envoi :", err.message);
      } else {
        console.log(`[Serial] Commande envoyée : ${cmd}`);
      }
    });
  } else {
    console.error("[Serial] Port non prêt");
  }
}

module.exports = { initSerial, envoyerCommande };
