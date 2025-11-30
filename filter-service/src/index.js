const express = require("express");
const { activateFilter, deactivateFilter, getStatus } = require("./serial");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.post("/filter/on", (req, res) => {
  activateFilter();
  res.json({ status: "on" });
});

app.post("/filter/off", (req, res) => {
  deactivateFilter();
  res.json({ status: "off" });
});

app.get("/filter/status", (req, res) => {
  res.json(getStatus());
});

app.listen(PORT, () => {
  console.log(`Filter Service running on port ${PORT}`);
});
