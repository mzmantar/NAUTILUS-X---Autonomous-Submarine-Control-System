const express = require("express");
const fs = require("fs");
const path = require("path");
const { captureImage, captureVideo } = require("./capture");

const app = express();
const PORT = process.env.PORT || 3010;

app.use(express.static("images"));
app.use(express.static("videos"));

app.get("/camera/image", async (req, res) => {
  try {
    const filename = await captureImage();
    res.json({ status: "image_captured", file: filename });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur capture image", details: err.message });
  }
});

app.get("/camera/video", async (req, res) => {
  try {
    const filename = await captureVideo();
    res.json({ status: "video_captured", file: filename });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur capture vidéo", details: err.message });
  }
});

app.listen(PORT, () => {
  if (!fs.existsSync("/app/images")) fs.mkdirSync("/app/images");
  if (!fs.existsSync("/app/videos")) fs.mkdirSync("/app/videos");
  console.log(`Camera service listening on port ${PORT}`);
});
