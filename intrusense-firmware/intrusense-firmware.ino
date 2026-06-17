/**
 * IntruSense Firmware
 * ESP8266 + PIR sensor + HC-SR04 ultrasonic module + buzzer + status LED
 *
 * LED behaviour:
 *   Solid ON   → Connected and idle
 *   Blinking   → Intrusion alert (unified with buzzer)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "config.h"

// ── Alert state (buzzer + LED blink are one unified alert) ──────────────────
static struct {
  bool          active       = false;
  unsigned long startedAt    = 0;
  unsigned long lastBlinkAt  = 0;
  bool          ledState     = false;
  int           blinksLeft   = 0;
} alert;

static unsigned long lastPollAt = 0;

// ── WiFi ─────────────────────────────────────────────────────────────────────
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

// ── Sensor ───────────────────────────────────────────────────────────────────
float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30 ms timeout
  return (duration == 0) ? 999.0f : (duration * 0.034f / 2.0f);
}

// ── Alert (buzzer + LED blink, non-blocking) ─────────────────────────────────
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

  // Non-blocking LED blink
  if (alert.blinksLeft > 0 && now - alert.lastBlinkAt >= BLINK_INTERVAL_MS) {
    alert.ledState = !alert.ledState;
    digitalWrite(LED_PIN, alert.ledState ? HIGH : LOW);
    alert.lastBlinkAt = now;
    alert.blinksLeft--;
  }

  // End alert after BUZZER_DURATION_MS
  if (now - alert.startedAt >= BUZZER_DURATION_MS) {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, WiFi.status() == WL_CONNECTED ? HIGH : LOW);
    alert.active = false;
  }
}

// ── HTTP ─────────────────────────────────────────────────────────────────────
void postSensorData(int motionDetected, float distanceCm) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  HTTPClient http;

  client.setInsecure();
  http.begin(client, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["deviceId"]       = DEVICE_ID;
  doc["motionDetected"] = motionDetected;
  doc["distanceCm"]     = distanceCm;

  String body;
  serializeJson(doc, body);

  int statusCode = http.POST(body);
  Serial.printf(statusCode > 0
    ? "[HTTP] POST %d\n"
    : "[HTTP] Error: %s\n",
    statusCode > 0 ? statusCode : 0,
    http.errorToString(statusCode).c_str());

  http.end();
}

// ── Setup / Loop ─────────────────────────────────────────────────────────────
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
}

void loop() {
  updateAlert(); // always tick the alert state machine

  if (millis() - lastPollAt < POLL_INTERVAL_MS) return;
  lastPollAt = millis();

  connectWifi();

  int   motionDetected = digitalRead(PIR_PIN);
  float distanceCm     = readDistanceCm();

  Serial.printf("[Sensor] Motion=%d  Distance=%.1f cm\n", motionDetected, distanceCm);

  bool isIntrusion = (motionDetected == HIGH && distanceCm < DISTANCE_THRESHOLD);
  if (isIntrusion) startAlert();

  postSensorData(motionDetected, distanceCm);
}
