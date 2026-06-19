#ifndef CONFIG_H
#define CONFIG_H

#define WIFI_SSID       "Wirespot"
#define WIFI_PASSWORD   "W12345678T"

#define READINGS_URL    "https://intrusense-be.onrender.com/api/readings"
#define SETTINGS_URL    "https://intrusense-be.onrender.com/api/settings"
#define DEVICE_ID       "node-01"

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
