#include <Wire.h>
#include <Adafruit_LIS3DH.h>

Adafruit_LIS3DH lis = Adafruit_LIS3DH();

void setup() {
  Serial.begin(9600);
  if (!lis.begin(0x18)) {
    Serial.println("Could not initialize LIS3DH");
    while (1);
  }
  
  lis.setRange(LIS3DH_RANGE_2_G);   // 2, 4, 8 or 16 G!
  lis.setDataRate(LIS3DH_DATARATE_10_HZ);
}

void loop() {
  lis.read(); // Read accelerometer data
  float xAccel = lis.x / 1000.0; // Normalize accelerometer reading
  Serial.println(xAccel); // Send x-axis acceleration via serial
  delay(50); // Adjust delay as needed
}
