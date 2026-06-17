#ifndef CONFIG_H
#define CONFIG_H

#define WIFI_SSID       "Wirespot"
#define WIFI_PASSWORD   "W12345678T"
// Set this to your deployed Render backend URL (HTTPS)
#define BACKEND_URL     "https://intrusense-be.onrender.com/api/readings"
#define DEVICE_ID       "node-01"

#define PIR_PIN         D5   // GPIO14
#define TRIG_PIN        D6   // GPIO12
#define ECHO_PIN        D7   // GPIO13
#define BUZZER_PIN      D8   // GPIO15
#define LED_PIN         D2   // GPIO4

#define POLL_INTERVAL_MS    500UL
#define BUZZER_DURATION_MS  2000UL
#define DISTANCE_THRESHOLD  150.0f   // cm — below this + PIR = intrusion
#define BLINK_COUNT         5
#define BLINK_INTERVAL_MS   80UL     // time between LED transitions during alert
#define WIFI_RETRY_LIMIT    20

#endif // CONFIG_H
