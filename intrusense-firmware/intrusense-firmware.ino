/**
 * IntruSense Firmware
 * ESP8266 + PIR sensor + HC-SR04 ultrasonic module + buzzer + status LED
 *
 * LED behaviour:
 *   Solid ON   → Connected and idle
 *   Blinking   → Intrusion alert (unified with buzzer)
 *
 * Armed state:
 *   Polled from backend every SETTINGS_INTERVAL_MS.
 *   Local alert only fires when armed.
 *   Explicitly set to true when settings endpoint is unreachable (fail-safe).
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "config.h"

// ── Runtime state ─────────────────────────────────────────────────────────────
static bool          armed              = true;
static unsigned long lastReadingPollAt  = 0;
static unsigned long lastSettingsPollAt = 0;

static struct {
  bool          active      = false;
  unsigned long startedAt   = 0;
  unsigned long lastBlinkAt = 0;
  bool          ledState    = false;
  int           blinksLeft  = 0;
} alert;

// ── WiFi ──────────────────────────────────────────────────────────────────────
void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("\n[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  for (int i = 0; i < WIFI_RETRY_LIMIT && WiFi.status() != WL_CONNECTED; i++) {
    delay(500);
    Serial.print(".");
  }

  bool connected = WiFi.status() == WL_CONNECTED;
  Serial.println(connected
    ? "\n[WiFi] Connected — IP: " + WiFi.localIP().toString()
    : "\n[WiFi] Failed. Will retry next cycle.");

  digitalWrite(LED_PIN, connected ? HIGH : LOW);
}

// ── Sensors ───────────────────────────────────────────────────────────────────
int readMotion() {
  return digitalRead(PIR_PIN);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30 ms timeout
  return (duration == 0) ? 999.0f : (duration * 0.034f / 2.0f);
}

// ── Settings ──────────────────────────────────────────────────────────────────
void fetchSettings() {
  if (WiFi.status() != WL_CONNECTED) {
    armed = true;
    return;
  }

  WiFiClientSecure client;
  HTTPClient http;

  client.setInsecure();
  http.begin(client, SETTINGS_URL);
  http.addHeader("x-api-key", DEVICE_API_KEY);

  int statusCode = http.GET();

  if (statusCode == 200) {
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, http.getString());
    if (!err && doc["data"]["armed"].is<bool>()) {
      armed = doc["data"]["armed"].as<bool>();
      Serial.printf("[Settings] armed=%s\n", armed ? "true" : "false");
    } else {
      armed = true;
      Serial.println("[Settings] Parse error — defaulting to armed");
    }
  } else {
    armed = true;
    Serial.printf("[Settings] Unreachable (%d) — defaulting to armed\n", statusCode);
  }

  http.end();
}

// ── Alert (buzzer + LED blink, non-blocking) ──────────────────────────────────
void startAlert() {
  if (alert.active) return;

  digitalWrite(BUZZER_PIN, HIGH);

  alert.active      = true;
  alert.startedAt   = millis();
  alert.lastBlinkAt = millis();
  alert.ledState    = false;
  alert.blinksLeft  = BLINK_COUNT * 2; // each blink = 1 LOW + 1 HIGH transition
}

void updateAlert() {
  if (!alert.active) return;

  unsigned long now = millis();

  if (alert.blinksLeft > 0 && now - alert.lastBlinkAt >= BLINK_INTERVAL_MS) {
    alert.ledState = !alert.ledState;
    digitalWrite(LED_PIN, alert.ledState ? HIGH : LOW);
    alert.lastBlinkAt = now;
    alert.blinksLeft--;
  }

  if (now - alert.startedAt >= BUZZER_DURATION_MS) {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, WiFi.status() == WL_CONNECTED ? HIGH : LOW);
    alert.active = false;
  }
}

// ── HTTP ──────────────────────────────────────────────────────────────────────
void postSensorData(int motion, float distanceCm) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  HTTPClient http;

  client.setInsecure();
  http.begin(client, READINGS_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", DEVICE_API_KEY);

  StaticJsonDocument<256> doc;
  doc["deviceId"]       = DEVICE_ID;
  doc["motionDetected"] = motion;
  doc["distanceCm"]     = distanceCm;

  String body;
  serializeJson(doc, body);

  int statusCode = http.POST(body);
  if (statusCode > 0) {
    Serial.printf("[HTTP] POST %d\n", statusCode);
  } else {
    Serial.printf("[HTTP] Error: %s\n", http.errorToString(statusCode).c_str());
  }

  http.end();
}

// ── Setup / Loop ──────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN,    INPUT);
  pinMode(TRIG_PIN,   OUTPUT);
  pinMode(ECHO_PIN,   INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN,    OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN,    LOW);

  connectWifi();
  fetchSettings();
}

void loop() {
  updateAlert();

  unsigned long now = millis();

  if (now - lastSettingsPollAt >= SETTINGS_INTERVAL_MS) {
    lastSettingsPollAt = now;
    fetchSettings();
  }

  if (now - lastReadingPollAt >= READING_INTERVAL_MS) {
    lastReadingPollAt = now;

    connectWifi();

    int   motion     = readMotion();
    float distanceCm = readDistanceCm();

    Serial.printf("[Sensor] Motion=%d  Distance=%.1f cm  Armed=%s\n",
      motion, distanceCm, armed ? "true" : "false");

    bool isIntrusion = (motion == HIGH && distanceCm < DISTANCE_THRESHOLD);
    if (armed && isIntrusion) startAlert();

    postSensorData(motion, distanceCm);
  }
}
