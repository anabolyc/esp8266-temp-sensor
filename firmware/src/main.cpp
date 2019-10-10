#include <ESP8266WiFi.h> //https://github.com/esp8266/Arduino
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h> //https://github.com/tzapu/WiFiManager

#include <OneWire.h>
#include <DS18B20.h>

#include <CloudIoTCore.h>
#include "esp8266_mqtt.h"

#ifndef LED_BUILTIN
#define LED_BUILTIN 13
#endif

#define ONE_WIRE_PWR 4
#define ONE_WIRE_BUS 5

#define PUBLISH_DATA_INTERVAL_MS 5 * 1000

OneWire oneWire(ONE_WIRE_BUS);
DS18B20 sensor(&oneWire);

void setup()
{
    Serial.begin(115200);

    WiFiManager wifiManager;
    //reset saved settings
    //wifiManager.resetSettings();

    //set custom ip for portal
    wifiManager.setAPStaticIPConfig(IPAddress(10, 0, 1, 1), IPAddress(10, 0, 1, 1), IPAddress(255, 255, 255, 0));

    //fetches ssid and pass from eeprom and tries to connect
    //if it does not connect it starts an access point with the specified name
    //here  "AutoConnectAP"
    //and goes into a blocking loop awaiting configuration
    //wifiManager.autoConnect("AutoConnectAP");
    //or use this for auto generated name ESP + ChipID
    wifiManager.autoConnect();

    //if you get here you have connected to the WiFi
    Serial.println("connected...yeey :)");

    pinMode(ONE_WIRE_PWR, OUTPUT);
    digitalWrite(ONE_WIRE_PWR, HIGH);
    sensor.begin();

    setupCloudIoT();
}

unsigned long lastMillis = 0;

void loop()
{
    mqttClient->loop();
    delay(10); // <- fixes some issues with WiFi stability

    if (!mqttClient->connected())
    {
        ESP.wdtDisable();
        Serial.println(">> connecting...");
        connect();
        ESP.wdtEnable(0);
    }

    if (lastMillis == 0 || millis() - lastMillis > PUBLISH_DATA_INTERVAL_MS)
    {
        sensor.requestTemperatures();
        while (!sensor.isConversionComplete()) {
            yield();        
        }
        
        float result = sensor.getTempC();
        Serial.println(result);

        String msg = String(result);
        publishTelemetry(msg);

        lastMillis = millis();
    }
}    
