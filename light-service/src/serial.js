const { SerialPort } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
});

function sendLightCommand(cmd) {
  console.log(`Envoi commande lumière : ${cmd}`);
  port.write(cmd + "\n", (err) => {
    if (err) {
      return console.error("Erreur d'envoi :", err.message);
    }
    console.log("Commande envoyée");
  });
}

module.exports = { sendLightCommand };
