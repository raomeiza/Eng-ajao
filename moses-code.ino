#include <LCD-I2C.h>
#include "DHT.h"
#include <WiFiManager.h>
#include "FS.h"
#include "SD.h"
#include "SPI.h"

const int B_Pin = 35;
const int BC_Pin = 13;
const int SM_Pin = 34;
#define DHTPIN 2

#define DHTTYPE DHT22 

LCD_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);


uint8_t degree_sign[8] =
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



uint8_t E_battery[8] =
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

uint8_t one_bar[8] =
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

uint8_t two_bar[8] =
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

uint8_t three_bar[8] =
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

uint8_t four_bar[8] =
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

uint8_t five_bar[8] =
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

uint8_t six_bar[8] =
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

int h;
int t;
float B_level = 0;
int Soil_moisture_level =  0;

char data1[50];

void setup() {
  // put your setup code here, to run once:

    WiFi.mode(WIFI_STA);
    Serial.begin(115200);
    lcd.begin();
    lcd.display();
    lcd.backlight();
    lcd.setCursor(0,0);
    lcd.print("connect to wifi"); 
    #ifdef REASSIGN_PINS
    SPI.begin(sck, miso, mosi, cs);
    if (!SD.begin(cs)) {
    #else
    if (!SD.begin()) {
    #endif
    Serial.println("Card Mount Failed");
    return;
    }

     WiFiManager wm;
     bool res;
     res = wm.autoConnect("Check_Soil_Moisture",""); // password protected ap


    pinMode(B_Pin, INPUT);
    pinMode(BC_Pin, INPUT);
    pinMode(SM_Pin, INPUT);

    dht.begin();

    lcd.createChar(0, E_battery);
    lcd.createChar(1, one_bar);
    lcd.createChar(2, two_bar);
    lcd.createChar(3, three_bar);
    lcd.createChar(4, four_bar);
    lcd.createChar(5, five_bar);
    lcd.createChar(6, six_bar);
    lcd.createChar(7, degree_sign);
    
    appendFile(SD, "/Sensor_Value.csv", "Temp.oC, Humidity%, Soil_Moisture% \n");
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
    delay(3000);
    
    
    }

void loop() {
  // put your main code here, to run repeatedly:
  long duration = millis()/1000;
  long thistime = 0;
  int BC_value = digitalRead(BC_Pin);
  int soil_moisture = analogRead(SM_Pin);
  Soil_moisture_level = map(soil_moisture, 4095,0,0,100);
  
lcd.clear();
//Battery Level section
float B_value = analogRead(B_Pin);
B_level = ((B_value * 3.9)/4095) * 5;
if(B_level < 3.30){
lcd.setCursor(15,0);
lcd.write(0);
 }
else if(B_level < 3.50){
lcd.setCursor(15,0);
lcd.write(1);
 }
else if(B_level < 3.60){
lcd.setCursor(15,0);
lcd.write(2);
 }

else if(B_level < 3.70){
lcd.setCursor(15,0);
lcd.write(3);
} 
else if(B_level < 3.80){
lcd.setCursor(15,0);
lcd.write(4);
}

else if(B_level < 3.90){
lcd.setCursor(15,0);
lcd.write(5);
}
else if(B_level < 4.80){
lcd.setCursor(15,0);
lcd.write(6);
}
/****************************************/


/*****************************************/

//Soil Moisture Level Display Section
  lcd.setCursor(2,0);
  lcd.print("Soil_M:");
  lcd.print(Soil_moisture_level);
  lcd.print("%");
/*****************************************/

  //Temperature Sensing Section 
  h = dht.readHumidity();
  // Read temperature as Celsius (the default)
   t = dht.readTemperature();
   lcd.setCursor(0,1);
   lcd.print("Temp:");
   lcd.print(t);
   lcd.write(7);
   lcd.print("C H:");
   lcd.print(h);
   lcd.print("%");

   String SD_Card_Data = (String)t + "," + h + "," + Soil_moisture_level +",\n";

//SD_card storage Section
SD_Card_Data.toCharArray(data1, sizeof(data1));

if(duration - thistime  >= 6){
 appendFile(SD, "/Sensor_Value.csv", data1);
  thistime = duration + 60;
}

//Battery Charging Section
if(BC_value== HIGH && B_level < 5){
lcd.setCursor(15,0);
lcd.write(0);
delay(1000);

lcd.setCursor(15,0);
lcd.write(1);
delay(1000);

lcd.setCursor(15,0);
lcd.write(2);
delay(1000);

lcd.setCursor(15,0);
lcd.write(3);
delay(1000);

lcd.setCursor(15,0);
lcd.write(4);
delay(1000);

lcd.setCursor(15,0);
lcd.write(5);
delay(1000);
}
delay(1000);
}

void writeFile(fs::FS &fs, const char *path, const char *message) {
  Serial.printf("Writing file: %s\n", path);

  File file = fs.open(path, FILE_WRITE);
  if (!file) {
    Serial.println("Failed to open file for writing");
    return;
  }
  if (file.print(message)) {
    Serial.println("File written");
  } else {
    Serial.println("Write failed");
  }
  file.close();
}

void appendFile(fs::FS &fs, const char *path, const char *message) {
  Serial.printf("Appending to file: %s\n", path);

  File file = fs.open(path, FILE_APPEND);
  if (!file) {
    Serial.println("Failed to open file for appending");
    return;
  }
  if (file.print(message)) {
    Serial.println("Message appended");
  } else {
    Serial.println("Append failed");
  }
  file.close();
}
