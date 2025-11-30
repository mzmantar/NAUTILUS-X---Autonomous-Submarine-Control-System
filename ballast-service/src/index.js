const express = require("express");
const {
  fillBallast,
  emptyBallast,
  stopBallast,
  getPressure,
} = require("./serial");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post("/ballast/fill", (req, res) => {
  fillBallast();
  res.json({ action: "filling ballast" });
});

app.post("/ballast/empty", (req, res) => {
  emptyBallast();
  res.json({ action: "emptying ballast" });
});

app.post("/ballast/stop", (req, res) => {
  stopBallast();
  res.json({ action: "pump stopped" });
});

app.get("/ballast/status", (req, res) => {
  res.json(getPressure());
});

app.listen(PORT, () => {
  console.log(`Ballast Service running on port ${PORT}`);
});
