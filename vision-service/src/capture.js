const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

function captureImage() {
  const filename = `${uuidv4()}.jpg`;
  const filepath = path.join("/app/images", filename);
  const command = `libcamera-still -o ${filepath} --nopreview`;

  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) return reject(err);
      resolve(filename);
    });
  });
}

function captureVideo() {
  const filename = `${uuidv4()}.h264`;
  const filepath = path.join("/app/videos", filename);
  const command = `libcamera-vid -o ${filepath} -t 5000 --nopreview`;

  return new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) return reject(err);
      resolve(filename);
    });
  });
}

module.exports = { captureImage, captureVideo };
