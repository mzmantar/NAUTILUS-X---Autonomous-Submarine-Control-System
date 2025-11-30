# 🌊 NAUTILUS-X

<p align="center">
  <img src="Nautilus-public/nautilus_mk1.png" alt="Nautilus Logo" width="220"/>
</p>

<p align="center">
  <strong>Autonomous control system for robotic submarine</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"/>
  <img src="https://img.shields.io/badge/docker-ready-brightgreen.svg" alt="Docker"/>
  <img src="https://img.shields.io/badge/node-16%2B-success.svg" alt="Node"/>
</p>

> Protected project. Unauthorized reproduction, distribution, or modification is prohibited.

---

## 📋 Table of Contents

- Overview
- Architecture
- Technologies
- Prerequisites
- Installation
- Usage
- Services
- API
- User Interface
- Embedded Firmware
- Development
- Contributing
- License

---

## 🎯 Overview

NAUTILUS-X is a complete platform for commanding and monitoring autonomous submarines. It combines a microservices backend, a modern Electron/React UI, and ESP32 firmware for real-time hardware control.

### Highlights

- Motor control with vector commands
- Autonomous navigation (Direct, Spiral, A*)
- GPS localization via SIM808
- Underwater vision (image/video)
- Programmable RGB lighting
- Battery and voltage monitoring
- Gyro/LIDAR/pressure sensors
- Ballast management (buoyancy)
- Electron dashboard with interactive map
- Docker-based deployment

---

## 🏗️ Architecture

Three main components:

### 1) Backend (microservices)

```
┌─────────────────┐
│   API Gateway   │  Port 8080
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴──────────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌─────────────┐                    ┌─────────────┐
│  Hardware   │                    │  Software   │
├─────────────┤                    ├─────────────┤
│ Ballast     │ :3001              │ Navigation  │ :3008
│ Battery     │ :3002              │ Vision      │ :3010
│ Filter      │ :3003              │ SIM808 GPS  │ (Python)
│ Gyro        │ :3004              │             │
│ LIDAR       │ :3005              │             │
│ Light       │ :3006              │             │
│ Motors      │ :3007              │             │
└─────────────┘                    └─────────────┘
```

### 2) User Interface (`my-app/`)

Electron + React (Vite):
- Real-time dashboard
- Interactive map (Leaflet/Mapbox)
- Sensor visualization
- HMR dev mode

### 3) Firmware (`Nautilus-Syncom/`)

Arduino code for ESP32 Dev Module:
- Serial communication with services
- Motor/relay control
- Sensor management (accelerometer, voltage, temperature)
- RGB LED commands

---

## 🛠️ Technologies

- Backend: Node.js 16+ (Express), Python 3.8+ (FastAPI – GPS), Docker/Compose, http-proxy-middleware, SerialPort
- Frontend: Electron 37+, React 19+, Vite 7+, Leaflet/Mapbox GL
- Firmware: Arduino IDE, ESP32 Dev Module (board 2.0.0)
- Quality/Packaging: ESLint, electron-builder

---

## 📋 Prerequisites

- Node.js 16+, npm/yarn
- Docker and Docker Compose
- Arduino IDE (≥ 1.8.x) + ESP32 support

---

## 🚀 Installation

### 1) Clone the repository

```powershell
git clone <repository-url>
cd Nautilus-X
```

### 2) Start microservices

```powershell
docker-compose up --build
# Detached mode
docker-compose up -d --build
```

Access points:
- API Gateway: `http://localhost:8080`
- Services: ports `3001` to `3010`

### 3) Electron UI

```powershell
cd my-app
npm install
npm run dev:all
# Or separately
npm run dev      # Vite (http://localhost:5173)
npm run electron # Launch Electron
```

### 4) ESP32 Firmware

1. Open Arduino IDE
2. Install ESP32 (URL: `https://dl.espressif.com/dl/package_esp32_index.json`)
3. Board: ESP32 Dev Module – Version 2.0.0
4. Open `Nautilus-Syncom/NautilusSyncom.ino`
5. Select COM port
6. Upload

---

## 📖 Usage

### Full startup

```powershell
# Backend
docker-compose up

# UI
cd my-app; npm run dev:all
```

### ESP32 connection

- Upload firmware
- Open serial monitor (115200 baud)
- Check with `isready`

### Typical flow

1. Initialization: UI connects to backend
2. Monitoring: real-time sensors
3. Navigation: set a map target
4. Control: motors, lights, etc.
5. Visualization: image/video capture

---

## 🔌 Services

| Service | Port | Role | Tech |
|---------|------|------|------|
| api-gateway | 8080 | Entry point, routing | Node.js/Express |
| motor-service | 3007 | Thrusters control | Node.js + SerialPort |
| navigation-service | 3008 | Algorithms (A*, Spiral, Direct) | Node.js |
| gyro-service | 3004 | Gyroscope orientation | Node.js |
| lidar-service | 3005 | Distance measurement | Node.js |
| vision-service | 3010 | Camera image/video | Node.js |
| battery-service | 3002 | Battery/voltage | Node.js + SerialPort |
| light-service | 3006 | RGB lighting | Node.js + SerialPort |
| ballast-service | 3001 | Buoyancy/ballasts | Node.js + SerialPort |
| filter-service | 3003 | Filtration | Node.js + SerialPort |
| sim808-gps-service | - | GPS localization | Python/FastAPI |
| sim808-network-service | - | GSM connectivity | Python |
| sim808-power-service | - | SIM808 power management | Python |
| sim808-sms-service | - | SMS | Python |

---

## 🌐 API

### API Gateway routing (`http://localhost:8080`)

```
/motor/*      → motor-service:3007
/navigation/* → navigation-service:3008
/gyro/*       → gyro-service:3004
/lidar/*      → lidar-service:3005
/vision/*     → vision-service:3010
/battery/*    → battery-service:3002
/light/*      → light-service:3006
/ballast/*    → ballast-service:3001
/filter/*     → filter-service:3003
```

### Examples

Navigate to GPS point:

```http
POST http://localhost:8080/navigation/navigate/to
Content-Type: application/json

{
  "latitude": 36.8065,
  "longitude": 10.1815,
  "algorithm": "astar"
}
```

Motor command:

```http
POST http://localhost:8080/motor/motors/command
Content-Type: application/json

{
  "cmd": "motor 1 100 1 motor 2 100 1"
}
```

Format: `motor <id> <speed> <direction>`
- `id`: 1–4
- `speed`: 0–255
- `direction`: 0 (backward) / 1 (forward)

Gyroscope:

```http
GET http://localhost:8080/gyro/gyro
```

Image capture:

```http
GET http://localhost:8080/vision/camera/image
```

Battery status:

```http
GET http://localhost:8080/battery/status
```

---

## 🖥️ User Interface

Tech: Electron, React, Vite, Leaflet/Mapbox

Useful scripts:

```powershell
npm run dev           # Vite (http://localhost:5173)
npm run electron      # Launch Electron
npm run dev:all       # Vite + Electron
npm run build         # Production build (dist/)
npm run build:electron # Electron build
npm run package       # Generate installer (release/)
npm run lint          # ESLint
npm run preview       # Preview
```

Packaging:

```powershell
npm run package
```

Outputs: `release/` (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`/`.deb`).

---

## 🤖 Embedded Firmware

Main modules (`Nautilus-Syncom/`):
- `Commands.cpp/hpp`: serial command parsing/execution
- `Motors.cpp/hpp`: DC motors control
- `Relays.cpp/hpp`: relays (ballast/filter)
- `RGBLight.cpp/hpp`: RGB LED strip
- `Accelerometer.cpp/hpp`: orientation sensor
- `SensorVoltage.cpp/hpp`: battery voltage
- `SensorMTU.cpp/hpp`, `SensorTF.cpp/hpp`, `SensorHook.cpp/hpp`, `SIO.cpp/hpp`

Available serial commands:

| Command | Format | Description |
|---------|--------|-------------|
| `isready` | `isready` | Check ready state |
| `motor` | `motor <id> <speed> <dir>` | Motor control (1–4, 0–255, 0/1) |
| `relay` | `relay <id> <state>` | Toggle relay (1–2, 0/1) |
| `rgblight` | `rgblight <r> <g> <b>` | RGB color (0–255) |

---

## 👨‍💻 Development

Project structure (excerpt):

```
Nautilus-X/
├── my-app/ (Electron/React)
├── Nautilus-Syncom/ (ESP32)
├── Nautilus-public/ (assets: logos/images)
├── logs/ (runtime logs)
└── backend services
  ├── api-gateway/
  ├── motor-service/
  ├── navigation-service/
  ├── battery-service/
  ├── ballast-service/
  ├── filter-service/
  ├── gyro-service/
  ├── lidar-service/
  ├── light-service/
  ├── vision-service/
  ├── sim808-gps-service/
  ├── sim808-network-service/
  ├── sim808-power-service/
  └── sim808-sms-service/
```

Tests & debug:

```powershell
# Live logs
docker-compose logs -f api-gateway

# Open Electron DevTools
# electron/main.js → win.webContents.openDevTools();
```

---

## ⚙️ Configuration

- `.env.example`: environment variables template. Copy to `.env` and adjust.
- Common variables:
  - `API_GATEWAY_PORT=8080`
  - `MOTOR_SERVICE_PORT=3007`
  - `NAVIGATION_SERVICE_PORT=3008`
  - Serial ports (Windows): `COM3`, `COM4`, etc.
- Docker Compose reads service-specific configs; set per-service `.env` if required.

Quick start with env:
```powershell
Copy-Item .env.example .env
# Edit .env with your ports/keys
code .env
```

---

## 📝 Logs

- Runtime logs stored in `logs/`.
- View Docker logs:
```powershell
docker-compose logs -f api-gateway
docker-compose logs -f motor-service
```
- Rotate/purge (manual):
```powershell
Get-ChildItem logs | Remove-Item -Force
```

---

## 🧩 Troubleshooting

- Cannot push to `main` (non-fast-forward):
```powershell
git fetch origin; git merge origin/main; git push origin main
# or
git fetch origin; git rebase origin/main; git push --force-with-lease origin main
```
- Image not displayed on GitHub:
  - Use repo-relative paths and `/` separators, e.g. `Nautilus-public/nautilus_mk1.png`.
- CRLF/LF warnings on SVG/files:
  - `.gitattributes` added to normalize line endings.
- Serial connection issues (ESP32):
  - Check COM port, baud 115200, `isready` returns OK.
- Ports already in use:
  - Change ports in `.env`, update Compose, restart.

---

## 🤝 Contributing

1. Fork
2. Branch: `git checkout -b feature/NewFeature`
3. Commit: `git commit -m "feat: NewFeature"`
4. Push: `git push origin feature/NewFeature`
5. Pull Request

Guidelines: clean code, tests, updated docs, respect conventions.

---

## 📄 License

Licensed under **MIT**.

---

## 👤 Author

- **Mohamed Mehdi Zmantar** – Lead Developer

---

<p align="center">
  Built with ❤️ for autonomous underwater exploration
</p>