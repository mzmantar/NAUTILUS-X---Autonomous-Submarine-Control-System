const { SerialPort, ReadlineParser } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0", // ou "COM3" sous Windows
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let pressure = 0;

parser.on("data", (line) => {
  try {
    const data = JSON.parse(line);
    if (data.sensors?.pressure !== undefined) {
      pressure = data.sensors.pressure;
    }
  } catch (e) {
    console.error("Erreur de parsing:", line);
  }
});

function fillBallast() {
  port.write("M"); // M = Montée = remplir
}

function emptyBallast() {
  port.write("D"); // D = Descente = vider
}

function stopBallast() {
  port.write("X"); // X = stop la pompe
}

function getPressure() {
  return { pressure };
}

module.exports = {
  fillBallast,
  emptyBallast,
  stopBallast,
  getPressure,
};
