const express = require("express");
const { getGyroData } = require("./gyro");

const app = express();
const PORT = process.env.PORT || 3004;

app.get("/gyro", (req, res) => {
  res.json(getGyroData());
});

app.listen(PORT, () => {
  console.log(`Gyro Service running on port ${PORT}`);
});
