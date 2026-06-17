/**
 * IntruSense Firmware — NodeMCU ESP8266
 *
 * Sensors:
 *   PIR    → D5 (GPIO14)  — passive infrared motion detection
 *   TRIG   → D6 (GPIO12)  — ultrasonic trigger
 *   ECHO   → D7 (GPIO13)  — ultrasonic echo
 *   BUZZER → D8 (GPIO15)  — local audible alert
 *   LED    → D2 (GPIO4)   — solid: online | rapid blink: intrusion
 *
 * Required Arduino libraries (install via Library Manager):
 *   - ESP8266WiFi       (bundled with ESP8266 board package)
 *   - ESP8266HTTPClient (bundled with ESP8266 board package)
 *   - ArduinoJson       (search "ArduinoJson" by Benoit Blanchon)
 *
 * Configuration: edit config.h before flashing.
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"


unsigned long lastPollAt    = 0;
unsigned long buzzerStartAt = 0;
bool          buzzerOn      = false;


void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("\n[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < WIFI_RETRY_LIMIT) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected — IP: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("\n[WiFi] Failed. Will retry next cycle.");
    digitalWrite(LED_PIN, LOW);
  }
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


void blinkLed(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, LOW);
    delay(80);
    digitalWrite(LED_PIN, HIGH);
    delay(80);
  }
}

void triggerLocalAlert() {
  if (buzzerOn) return;
  digitalWrite(BUZZER_PIN, HIGH);
  buzzerStartAt = millis();
  buzzerOn      = true;
  blinkLed(BLINK_COUNT);
}


void postSensorData(int motionDetected, float distanceCm) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClient client;
  HTTPClient http;

  http.begin(client, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["deviceId"]       = DEVICE_ID;
  doc["motionDetected"] = motionDetected;
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
  if (buzzerOn && millis() - buzzerStartAt >= BUZZER_DURATION_MS) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerOn = false;
    // Restore solid LED to indicate still online
    if (WiFi.status() == WL_CONNECTED) digitalWrite(LED_PIN, HIGH);
  }

  if (millis() - lastPollAt < POLL_INTERVAL_MS) return;
  lastPollAt = millis();

  connectWifi();

  int   motionDetected = digitalRead(PIR_PIN);
  float distanceCm = readDistanceCm();

  Serial.printf("[Sensor] Motion=%d  Distance=%.1f cm\n", motionDetected, distanceCm);

  bool isIntrusion = (motionDetected == HIGH && distanceCm < DISTANCE_THRESHOLD);

  if (isIntrusion) {
    triggerLocalAlert();
  }

  postSensorData(motionDetected, distanceCm);
}
