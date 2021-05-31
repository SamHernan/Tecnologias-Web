#include <WiFi.h>
#include <PubSubClient.h>
#include "DHTesp.h"
#include "time.h"
#include <ArduinoJson.h>

#define DHTpin 15    //D15 del ESP32 DevKit

// Update these with values suitable for your network.
const char* ssid = "Samuel";
const char* password = "Samuel4521";
const char* mqtt_server = "broker.emqx.io";

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = -21600;
const int   daylightOffset_sec = 3600;



//DHT Sensor
DHTesp dht;
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;

#define MSG_BUFFER_SIZE	(300)
char msg[MSG_BUFFER_SIZE];

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Topico-> [");
  Serial.print(topic);
  Serial.print("] json->");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    //(clientId.c_str(), "profe", "123456")
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // ... and resubscribe
      client.subscribe("datosMetereologicos");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  dht.setup(DHTpin, DHTesp::DHT11); //for DHT11 Connect DHT sensor to GPIO 17
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
   configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  delay(dht.getMinimumSamplingPeriod());
  if(client.connected()){
    unsigned long now = millis();
    if (now - lastMsg > 8000) {
      lastMsg = now;

      float humedity =  dht.getHumidity();
      float temperature = dht.getTemperature();

      if (isnan(humedity) || isnan(temperature)) {
        Serial.println("No se pudo leer tu sensor DHT!");
        return;
      }
      String estado;
      String estadoTem;
      String estadoHum;
      if(temperature <= 14.9){
        estadoTem = "Mínima";
      }else if(temperature >= 15 and temperature < 20){
        estadoTem = "Estable";
      }else if(temperature >= 20 and temperature <= 25){
        estadoTem = "Óptima";
      }else if(temperature >= 25 and temperature < 35){
        estadoTem = "Alta";
      }else if(temperature >= 35){
        estadoTem = "Máxima";
      }

      if(humedity <= 59){
        estadoHum = "Inferior";
      }else if(humedity >= 60 and humedity < 81){
        estadoHum = "Óptima";
      }else if(humedity > 80){
        estadoHum = "Superior";
      }

      if(estadoTem == "Mínima" and estadoHum == "Inferior"){
          estado = "¡Temperatura y Humedad Baja!";
      }else if(estadoTem == "Mínima" and estadoHum == "Óptima"){
          estado = "¡Temperatura Baja!";
      }else if(estadoTem == "Mínima" and estadoHum == "Superior"){
          estado = "¡Temperatura Baja, Humedad Alta!";
      }else if(estadoTem == "Estable" and estadoHum == "Inferior"){
        estado = "¡Temperatura Estable, Humedad Baja!";
      }else if(estadoTem == "Estable" and estadoHum == "Óptima"){
        estado = "¡Temperatura Estable!";
      }else if(estadoTem == "Estable" and estadoHum == "Superior"){
        estado = "¡Temperatura Estable, Humedad Alta!";
      }else if(estadoTem == "Óptima" and estadoHum == "Inferior"){
        estado = "!Humedad Baja!";
      }else if(estadoTem == "Óptima" and estadoHum == "Óptima"){
        estado = "¡Excelente!";
      }else if(estadoTem == "Óptima" and estadoHum == "Superior"){
        estado = "!Humedad Alta!";
      }else if(estadoTem == "Alta" and estadoHum == "Inferior"){
        estado = "¡Temperatura Alta, Humedad Baja!";
      }else if(estadoTem == "Alta" and estadoHum == "Óptima"){
        estado = "¡Temperatura Alta!";
      }else if(estadoTem == "Alta" and estadoHum == "Superior"){
        estado = "¡Temperatura y Humedad Alta!";
      }else if(estadoTem == "Máxima" and estadoHum == "Inferior"){
        estado = "¡Temperatura Peligrosa, Humedad Baja!";
      }else if(estadoTem == "Máxima" and estadoHum == "Óptima"){
        estado = "¡Temperatura Peligrosa!";
      }else if(estadoTem == "Máxima" and estadoHum == "Superior"){
        estado = "¡Temperatura y Humedad Peligrosas!";
      }

      struct tm timeinfo;
      if(!getLocalTime(&timeinfo)){
        Serial.println("Failed to obtain time");
        return;
      }

      char timeStringBuff[50];
      strftime(timeStringBuff, sizeof(timeStringBuff), "%A, %B %d %Y %H:%M:%S", &timeinfo);
      String fecha = String(timeStringBuff);
      
      Serial.println();
 
      StaticJsonDocument<MSG_BUFFER_SIZE> myJson;
      myJson["humedad"] = humedity;
      myJson["temperatura"] = temperature;
      myJson["estado"] = estado;
      myJson["fecha"] = fecha;

      serializeJson(myJson, msg);
      client.publish("datosMetereologicos", msg);
    }
  }
}
