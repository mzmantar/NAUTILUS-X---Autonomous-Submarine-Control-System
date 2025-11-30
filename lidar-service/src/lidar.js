const { SerialPort, ReadlineParser } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let lastData = { distance: 0, strength: 0 };

parser.on("data", (line) => {
  try {
    const json = JSON.parse(line);
    if (json.sensors) {
      lastData = json.sensors;
    }
  } catch (e) {
    console.error("JSON LIDAR invalide:", line);
  }
});

function getLidarData() {
  return lastData;
}

module.exports = { getLidarData };
