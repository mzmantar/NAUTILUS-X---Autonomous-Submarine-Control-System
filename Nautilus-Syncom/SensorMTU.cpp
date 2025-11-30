
#include <Arduino.h>
#include <Wire.h>
#include "SIO.hpp"
#include "SensorMTU.hpp"

typedef uint8_t GPIOPin;

namespace SensorMTU {
    int16_t accX, accY, accZ, gyroX, gyroY, gyroZ, tempRaw;

    void initialize(GPIOPin sdaPin, GPIOPin sclPin)
    {
        Wire.begin(sdaPin, sclPin);
        Wire.beginTransmission(0x68);
        Wire.write(0x6B);
        Wire.write(0x00);
        Wire.endTransmission();
    }

    void    updateValues()
    {
        Wire.beginTransmission(0x68);
        Wire.write(0x3B);
        Wire.endTransmission(false);
        Wire.requestFrom(0x68, 14);

        accX = Wire.read() << 8 | Wire.read();
        accY = Wire.read() << 8 | Wire.read();
        accZ = Wire.read() << 8 | Wire.read();
        tempRaw = Wire.read() << 8 | Wire.read();
        gyroX = Wire.read() << 8 | Wire.read();
        gyroY = Wire.read() << 8 | Wire.read();
        gyroZ = Wire.read() << 8 | Wire.read();
    }
    int16_t getAccX() {
        return accX;
    }
    int16_t getAccY() {
        return accY;
    }
    int16_t getAccZ() {
        return accZ;
    }
    int16_t getGyroX() {
        return gyroX;
    }
    int16_t getGyroY() {
        return gyroY;
    }
    int16_t getGyroZ() {
        return gyroZ;
    }
    
    float getTemp() {
        return (tempRaw / 340.0) + 36.53;
    };
};