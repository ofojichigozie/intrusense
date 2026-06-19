#ifndef CONFIG_H
#define CONFIG_H

#define WIFI_SSID       "Wirespot"
#define WIFI_PASSWORD   "W12345678T"

#define READINGS_URL    "https://intrusense-be.onrender.com/api/readings"
#define SETTINGS_URL    "https://intrusense-be.onrender.com/api/settings/firmware"
#define DEVICE_ID       "node-01"
#define DEVICE_API_KEY  "is_1c4f7a2e9d6b3f8c0a5e2d7b4f1c8a3e"

#define PIR_PIN         D5   // GPIO14
#define TRIG_PIN        D6   // GPIO12
#define ECHO_PIN        D7   // GPIO13
#define BUZZER_PIN      D8   // GPIO15
#define LED_PIN         D2   // GPIO4

#define READING_INTERVAL_MS   2000UL    // sensor read + POST cadence
#define SETTINGS_INTERVAL_MS  15000UL  // how often to re-fetch armed state
#define BUZZER_DURATION_MS    2000UL
#define DISTANCE_THRESHOLD    150.0f   // cm — below this + PIR = intrusion
#define BLINK_COUNT           5
#define BLINK_INTERVAL_MS     80UL
#define WIFI_RETRY_LIMIT      20

#endif // CONFIG_H
