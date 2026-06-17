# IntruSense

IntruSense is a small smart-home intrusion detection stack made of three parts:

- Backend: Express + TypeScript + MongoDB + Socket.IO + Telegram integration
- Frontend: React + Vite + Tailwind dashboard for monitoring and settings
- Firmware: ESP8266 NodeMCU code for PIR + ultrasonic sensing and sensor uploads

## Project layout

- `intrusense-backend/` — API server and admin/reading logic
- `intrusense-frontend/` — web dashboard and controls
- `intrusense-firmware/` — ESP8266 firmware for the sensor node

## Quick start

1. Clone the repository
   ```sh
   git clone https://github.com/ofojichigozie/intrusense.git
   cd intrusense
   ```
2. Start the backend from `intrusense-backend/`
3. Start the frontend from `intrusense-frontend/`
4. Flash and monitor the firmware from `intrusense-firmware/`

## Component guides

- Backend: see `intrusense-backend/README.md`
- Frontend: see `intrusense-frontend/README.md`
- Firmware: see `intrusense-firmware/README.md`
