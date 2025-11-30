const { SerialPort, ReadlineParser } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB1",
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let lastGyroData = {
  gyro: { x: 0, y: 0, z: 0 },
  accel: { x: 0, y: 0, z: 0 },
  temp: 0,
};

parser.on("data", (line) => {
  try {
    const json = JSON.parse(line);
    if (json.gyro) {
      lastGyroData = json;
    }
  } catch (e) {
    console.error("Donnée invalide:", line);
  }
});

function getGyroData() {
  return lastGyroData;
}

module.exports = { getGyroData };
