const { SerialPort, ReadlineParser } = require("serialport");

const port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let batteryData = {
  voltage: null,
  current: null,
  percentage: null,
};

parser.on("data", (line) => {
  try {
    const data = JSON.parse(line);
    if (data.battery) {
      batteryData = {
        voltage: data.battery.voltage,
        current: data.battery.current,
        percentage: data.battery.percentage,
      };
    }
  } catch (err) {
    console.error("Erreur de parsing :", line);
  }
});

function getBatteryStatus() {
  return batteryData;
}

module.exports = { getBatteryStatus };
