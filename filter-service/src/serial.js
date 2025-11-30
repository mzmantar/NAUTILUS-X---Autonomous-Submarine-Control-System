const { SerialPort, ReadlineParser } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let pressure = 0;
let filterActive = false;

parser.on("data", (line) => {
  try {
    const data = JSON.parse(line);

    if (data.status === "filter") {
      filterActive = data.active;
      pressure = data.pressure;
    }

    if (data.sensors?.pressure !== undefined) {
      pressure = data.sensors.pressure;
    }
  } catch (e) {
    console.error("Erreur de parsing:", line);
  }
});

function activateFilter() {
  port.write("O"); // 'O' = ON, commande à implémenter dans ton Arduino
}

function deactivateFilter() {
  port.write("P"); // 'P' = OFF
}

function getStatus() {
  return {
    active: filterActive,
    pressure: pressure,
  };
}

module.exports = {
  activateFilter,
  deactivateFilter,
  getStatus,
};
