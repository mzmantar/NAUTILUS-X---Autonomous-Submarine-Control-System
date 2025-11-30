const express = require("express");
const { getBatteryStatus } = require("./serial");

const app = express();
const PORT = process.env.PORT || 3002;

app.get("/battery/status", (req, res) => {
  res.json(getBatteryStatus());
});

app.listen(PORT, () => {
  console.log(`Battery Service running on port ${PORT}`);
});
