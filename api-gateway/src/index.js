const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = 8080;

app.use(
  "/ballast",
  createProxyMiddleware({
    target: "http://ballast-service:3001",
    changeOrigin: true,
  })
);
app.use(
  "/battery",
  createProxyMiddleware({
    target: "http://battery-service:3002",
    changeOrigin: true,
  })
);
app.use(
  "/filter",
  createProxyMiddleware({
    target: "http://filter-service:3003",
    changeOrigin: true,
  })
);
app.use(
  "/gyro",
  createProxyMiddleware({
    target: "http://gyro-service:3004",
    changeOrigin: true,
  })
);
app.use(
  "/lidar",
  createProxyMiddleware({
    target: "http://lidar-service:3005",
    changeOrigin: true,
  })
);
app.use(
  "/light",
  createProxyMiddleware({
    target: "http://light-service:3006",
    changeOrigin: true,
  })
);
app.use(
  "/motor",
  createProxyMiddleware({
    target: "http://motor-service:3007",
    changeOrigin: true,
  })
);
app.use(
  "/navigation",
  createProxyMiddleware({
    target: "http://navigation-service:3008",
    changeOrigin: true,
  })
);
app.use(
  "/vision",
  createProxyMiddleware({
    target: "http://vision-service:3010",
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
