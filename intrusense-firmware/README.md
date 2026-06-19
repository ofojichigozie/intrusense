# IntruSense Firmware

This firmware runs on an ESP8266 NodeMCU board and reads motion and distance data from the PIR sensor and ultrasonic module. It connects to Wi-Fi, posts readings to the backend API, and triggers a local buzzer/LED alert when an intrusion is detected.

## Requirements

- Arduino IDE or Arduino CLI
- ESP8266 board support
- ArduinoJson library
- A NodeMCU ESP8266 board
- The backend API running and reachable from the device

## Setup

1. Clone the repository and move into the root folder:
   ```sh
   git clone https://github.com/ofojichigozie/intrusense.git
   cd intrusense
   ```
2. Move into the firmware folder:
   ```sh
   cd intrusense-firmware
   ```
3. Edit `config.h` and update:
   - `WIFI_SSID`
   - `WIFI_PASSWORD`
   - `BACKEND_URL`
   - `DEVICE_ID`
4. Install the required board package and library if you are using Arduino CLI.

## Arduino CLI setup

If you use Arduino CLI, run the following commands from the firmware folder (`.`):

```sh
arduino-cli core update-index
arduino-cli core install esp8266:esp8266
arduino-cli lib install ArduinoJson
```

You can verify the installed toolchain with:

```sh
arduino-cli core list
arduino-cli lib list
```

## Compile

```sh
arduino-cli compile --fqbn esp8266:esp8266:nodemcuv2 .
```

## Upload

Replace `COM3` with your board port:

```sh
arduino-cli upload -p COM3 --fqbn esp8266:esp8266:nodemcuv2 .
```

On Linux or macOS, the port may look like `/dev/ttyUSB0` instead.

## Monitor serial output

```sh
arduino-cli monitor -p COM3 --config baudrate=9600
```

The board FQBN is optional for monitoring. If your CLI setup needs it, you can add `--fqbn esp8266:esp8266:nodemcuv2`.

If the upload or monitor commands fail, confirm the board is connected and the port is correct.
