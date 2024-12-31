#include <Arduino.h>
#include <LCD_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <SPI.h>
#include <SD.h>
#include <ArduinoJson.h>
#include "base32.h"
#include "DHT.h"
#include "time.h"
#include "esp_sntp.h"
#include <Wire.h>
#include "totp.h"

// define the pins used by the battery level sensor
const int B_Pin = 35;
const int BC_Pin = 13;
const int SM_Pin = 34;

// define the pins used by the DHT22 sensor
#define DHTPIN 2

// define the type of sensor
#define DHTTYPE DHT22

// define variables used to store informations.
#define WIFI_SSID "A OMEIZA"
#define WIFI_PASSWORD "OMEIZA121"
const char SERVER_URL[] = "https://dv25fnzj-5000.uks1.devtunnels.ms/iot";
#define SD_CS_PIN 5

const char ntpServer1[] = "pool.ntp.org";
const char ntpServer2[] = "time.nist.gov";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 0;

const char time_zone[] = "CET-1CEST,M3.5.0,M10.5.0/3"; // TimeZone rule for Europe/Rome including daylight adjustment rules (optional)

#define DEVICE_SECRET "N5NUOPSTGZXXSSRSENBSYV3BKRKDYVSJ"
String apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NzMzZTdlZGIyNWIyNTRhMzgxYWU5NCIsIm1hYyI6IjQzOjMwOjNBOjM1OjQ0OjNBIiwibGFzdFNlZW4iOiIyMDI0LTEyLTMxVDAwOjQ0OjQ2LjIzN1oiLCJpYXQiOjE3MzU2MDU4ODYsImV4cCI6MTczNTY5MjI4Nn0.klvoPD2YzGSvLBETbHPUqZkklo2gBUy9_KJJwU8Dogg";

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 300000/5; // send data every 1 minute
// lets create a variable that will store the mac address of the device
char mac[18];

LCD_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);
// Buffer to hold the decoded secret
std::vector<uint8_t> hmacKey;

// Initialize TOTP with the decoded secret
TOTP* totp;
Preferences preferences;

// define a struct to store the battery status
struct BatteryStatus
{
    float voltage;
    bool isCharging;
};

const uint8_t degree_sign[] =
{
    0b00110,
    0b01001,
    0b01001,
    0b00110,
    0b00000,
    0b00000,
    0b00000,
    0b00000,
};

const uint8_t E_battery[] =
{
    0b01110,
    0b10001,
    0b10001,
    0b10001,
    0b10001,
    0b10001,
    0b10001,
    0b11111,
};

const uint8_t one_bar[] =
{
    0b01110,
    0b10001,
    0b10001,
    0b10001,
    0b10001,
    0b10001,
    0b11111,
    0b11111,
};

const uint8_t two_bar[] =
{
    0b01110,
    0b10001,
    0b10001,
    0b10001,
    0b10001,
    0b11111,
    0b11111,
    0b11111,
};

const uint8_t three_bar[] =
{
    0b01110,
    0b10001,
    0b10001,
    0b10001,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
};

const uint8_t four_bar[] =
{
    0b01110,
    0b10001,
    0b10001,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
};

const uint8_t five_bar[] =
{
    0b01110,
    0b10001,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
};

const uint8_t six_bar[] =
{
    0b01110,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
    0b11111,
};

// define a function to read the battery status
BatteryStatus readBatteryStatus()
{
    BatteryStatus status;
    int level = analogRead(B_Pin);               // Replace with the appropriate pin for your battery level
    status.voltage = level * (3.3 / 4095.0) * 2; // Assuming a voltage divider
    status.isCharging = digitalRead(BC_Pin);     // Replace with the appropriate pin for your charging status
    return status;
}

// define function for reading the temperature and humidity
int *readTemperatureAndHumidity()
{
    static int result[2]; // static to ensure the array persists after the function returns
    dht.begin();
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    result[0] = static_cast<int>(t);
    result[1] = static_cast<int>(h);
    return result;
}

// define function for reading the soil moisture
int readSoilMoisture()
{
    int moisture = analogRead(SM_Pin); // Replace with the appropriate pin for your soil moisture sensor
    return moisture;
}

// function to print local time
String printLocalTime(bool shortTime = false)
{
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo))
    {
        return "No time available (yet)";
    }
    if (shortTime)
    {
        char buffer[26];
        strftime(buffer, sizeof(buffer), "%b %d, %H:%M", &timeinfo);
        return String(buffer);
    }
    char buffer[64];
    strftime(buffer, sizeof(buffer), "%A, %B %d %Y %H:%M:%S", &timeinfo);
    return String(buffer);
}

// function to connect to WiFi
void connectWiFi()
{
    Serial.print("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    sprintf(mac, "%02X:%02X:%02X:%02X:%02X:%02X", WiFi.macAddress()[0], WiFi.macAddress()[1], WiFi.macAddress()[2], WiFi.macAddress()[3], WiFi.macAddress()[4], WiFi.macAddress()[5]);
    Serial.println("Mac address: " + String(mac));
    Serial.println("Connected!");
}

// function to generate TOTP
String generateTOTP(const String &secret)
{
    long GMT = time(nullptr);
    char* newCode = totp->getCode(GMT);
    return String(newCode);
}

// function to save data to SD card
void saveToSD(const String &data)
{
    File file = SD.open("/stale_data.json", FILE_APPEND);
    if (file)
    {
        file.println(data);
        file.close();
    }
    else
    {
        Serial.println("Failed to write to SD card.");
    }
}

// function to clear data from SD card
void clearSD()
{
    if (SD.exists("/stale_data.json"))
    {
        SD.remove("/stale_data.json");
        Serial.println("Cleared stale data.");
    }
}

// function to read stale data from SD card
// filepath: /c:/Users/Omeiza/Documents/Arduino/secure_iot/secure_iot.ino
String readStaleData()
{
    String staleData = "";
    File file = SD.open("/stale_data.json", FILE_READ);
    if (file)
    {
        while (file.available())
        {
            staleData += file.readString();
        }
        file.close();
    }

    // Parse the JSON array
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, staleData);
    if (error)
    {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return "";
    }

    // Extract the inner contents of the JSON array
    String innerContents;
    for (JsonVariant v : doc.as<JsonArray>())
    {
        if (!innerContents.isEmpty())
        {
            innerContents += ",";
        }
        innerContents += v.as<String>();
    }

    return innerContents;
}

// function to send data to server
bool sendData(const String &data)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi not connected.");
        return false;
    }

    HTTPClient http;
    String url = String(SERVER_URL) + "/data";
    Serial.println("Url: " + url);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + apiToken);
    http.addHeader("X-TOTP", generateTOTP(DEVICE_SECRET));
    http.addHeader("X-MAC", mac);

    int httpResponseCode = http.POST(data);

    // Print response body for debugging
    String response = http.getString();
    Serial.println("Response: " + response);

    if (httpResponseCode == 200)
    {
        Serial.println("Data sent successfully.");
        // clearSD(); // Clear stale data on successful send
        http.end();
        // get the new token form response header
        String newToken = http.header("X-New-Token");
        String newTotpSecret = http.header("X-New-Totp-Secret");
        if (!newToken.isEmpty())
        {
            apiToken = newToken;
            preferences.putString("apiToken", newToken);
        }
        // if (!newTotpSecret.isEmpty())
        // {
        //     DEVICE_SECRET = newTotpSecret;
        //     preferences.putString("DEVICE_SECRET", newTotpSecret);
        // }
        preferences.putULong("lastSendTime", millis());
        return true;
    }
    else if (httpResponseCode == 401)
    {
        Serial.println("Unauthorized. Requesting new API token.");
        // Handle API token renewal
        String newToken = requestNewToken();
        if (!newToken.isEmpty())
        {
            apiToken = newToken;
        }
    }
    else
    {
        Serial.printf("Failed to send data. HTTP response code: %d\n", httpResponseCode);
    }

    http.end();
    return false;
}
// function to request new API token
String requestNewToken()
{
    HTTPClient http;
        String url = String(SERVER_URL) + "/token";
    http.begin(url);

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-TOTP", generateTOTP(DEVICE_SECRET));
    http.addHeader("X-MAC", mac);
    http.addHeader("Authorization", "Bearer" + apiToken);

    int httpResponseCode = http.GET();

    if (httpResponseCode == 200)
    {
        String response = http.getString();
        if (response.isEmpty())
        {
            Serial.println("Failed to request new token. Empty response.");
            return "";
        }
        preferences.putString("apiToken", response);
        apiToken = response;
        Serial.println("Received new token: " + response);
        return response;
    }
    else
    {
        Serial.printf("Failed to request new token. HTTP response code: %d\n", httpResponseCode);
    }

    http.end();
    return "";
}

// setup function
void setup()
{
    Serial.begin(115200);
    Wire.begin();
    preferences.begin("secure_iot", false);

    if(preferences.isKey("apiToken"))
    {
        apiToken = preferences.getString("apiToken");
    }
    if(preferences.isKey("lastSendTime"))
    {
        lastSendTime = preferences.getULong("lastSendTime");
    }

    lcd.begin(&Wire);
    lcd.display();
    lcd.backlight();
    lcd.setCursor(0,0);
    lcd.print("connect to wifi");
    connectWiFi(); // this will also assing the mac address to the mac variable
    // Initialize NTP
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2);

    // Wait for time to be set
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("Failed to obtain time");
        return;
    }
    Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");

    // Decode the Base32 secret
    hmacKey = Base32::decode(DEVICE_SECRET);

    // Print the decoded secret for verification
    Serial.print("Decoded Secret: ");
    for (size_t i = 0; i < hmacKey.size(); i++) {
        Serial.printf("%02X", hmacKey[i]);
    }
    Serial.println();

    // Initialize TOTP with the decoded secret
    totp = new TOTP(hmacKey.data(), hmacKey.size());

    // Generate TOTP code
    long currentTime = time(nullptr); // Get the current time
    char* code = totp->getCode(currentTime);
    Serial.print("TOTP Code: ");
    Serial.println(code);
    // check if apiToken is stored in preferences
    if (preferences.isKey("apiToken"))
    {
        apiToken = preferences.getString("apiToken");
    }

    // // check if DEVICE_SECRET is stored in preferences
    // if (preferences.isKey("DEVICE_SECRET"))
    // {
    //     DEVICE_SECRET = preferences.getString("DEVICE_SECRET");
    // }

    if (!SD.begin(SD_CS_PIN))
    {
        Serial.println("Failed to initialize SD card.");
        return;
    }
    lcd.createChar(0, (uint8_t*)E_battery);
    lcd.createChar(1,(uint8_t*)one_bar);
    lcd.createChar(2, (uint8_t*)two_bar);
    lcd.createChar(3, (uint8_t*)three_bar);
    lcd.createChar(4, (uint8_t*)four_bar);
    lcd.createChar(5, (uint8_t*)five_bar);
    lcd.createChar(6, (uint8_t*)six_bar);
    lcd.createChar(7, (uint8_t*)degree_sign);

    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2);
    printLocalTime();

    pinMode(B_Pin, INPUT);
    pinMode(BC_Pin, INPUT);
    pinMode(SM_Pin, INPUT);

    dht.begin();
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("initializing....");
    lcd.setCursor(0,1);
    lcd.print("please wait");
    delay(3000);
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Done");
    lcd.setCursor(0,1);
    lcd.print("Welcome");
    Serial.println("welcome");
    delay(1000);
}

// loop function
void loop()
{
    unsigned long currentTime = millis();
    BatteryStatus status = readBatteryStatus();
    int *tempHum = readTemperatureAndHumidity();
    int soilMoisture = readSoilMoisture();
    String timeNowString = printLocalTime(); // Use short format

    // print all data to the serial monitor
    Serial.print("Battery voltage: ");
    Serial.print(status.voltage);
    Serial.println("V");
    Serial.print("Charging status: ");
    Serial.println(status.isCharging ? "Charging" : "Discharging");
    Serial.print("Temperature: ");
    Serial.print(tempHum[0]);
    Serial.write(7);
    Serial.println("C");
    Serial.print("Humidity: ");
    Serial.print(tempHum[1]);
    Serial.println("%");
    Serial.print("Soil moisture: ");
    Serial.print(soilMoisture);
    Serial.println("%");
    Serial.print("Time: ");
    Serial.println(timeNowString);
    Serial.print("TOTP: ");
    Serial.println(generateTOTP(DEVICE_SECRET));
    Serial.println("Current time: " + String(currentTime));
    Serial.println("Last send time: " + String(lastSendTime));
    Serial.println("Send interval: " + String(sendInterval));
    Serial.println("Time since last send: " + String(currentTime - lastSendTime));
    lcd.clear();

    // Display battery level
    lcd.setCursor(15, 0);
    if(status.voltage > 4.2)
    {
        lcd.write(0);
    }
    else if(status.voltage > 4.0)
    {
        lcd.write(1);
    }
    else if(status.voltage > 3.8)
    {
        lcd.write(2);
    }
    else if(status.voltage > 3.6)
    {
        lcd.write(3);
    }
    else if(status.voltage > 3.4)
    {
        lcd.write(4);
    }
    else if(status.voltage > 3.2)
    {
        lcd.write(5);
    }
    else
    {
        lcd.write(6);
    }

    // set cursor just before the battery level
    // if charging, display a plus sign before the battery level else display a minus sign
    lcd.setCursor(14, 0);
    if (status.isCharging)
    {
        lcd.print("+");
    }

    // Display the date and time in the format "Jan 12, 12:23"
    lcd.setCursor(0, 0);
    lcd.print(printLocalTime(true));

    // Display temperature and humidity, and soil moisture as T: 25C H: 50% S: 30%
    lcd.setCursor(0, 1);
    lcd.print("T:" + String(tempHum[0]) + (char)7 + " H:" + String(tempHum[1]) + " S:" + String(soilMoisture) + "%");

    if (currentTime - lastSendTime >= sendInterval)
    {
        StaticJsonDocument<512> doc;
        doc["batteryVoltage"] = status.voltage;
        doc["isCharging"] = status.isCharging;
        doc["temperature"] = tempHum[0];
        doc["humidity"] = tempHum[1];
        doc["soilMoisture"] = soilMoisture;
        doc["time"] = timeNowString;

        String data;
        serializeJson(doc, data);

        String staleData = readStaleData();
        if (!staleData.isEmpty())
        {
            data = "[" + staleData + "," + data + "]";
        }
        else
        {
            data = "[" + data + "]";
        }

        if (!sendData(data))
        {
            saveToSD(data);
        } else {
            clearSD();
        }

        lastSendTime = currentTime;
    }
    delay(1000);
}