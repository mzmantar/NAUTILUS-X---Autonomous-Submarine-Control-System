const express = require("express");
const { getLidarData } = require("./lidar");

const app = express();
const PORT = process.env.PORT || 3005;

app.get("/lidar", (req, res) => {
  res.json(getLidarData());
});

app.listen(PORT, () => {
  console.log(`LIDAR Reader API is running on port ${PORT}`);
});
