#ifndef ACCELEROMETER_HPP
#define ACCELEROMETER_HPP
#include <Arduino.h>

typedef uint8_t GPIOPin;

namespace Accelerometer {
    void initialize(GPIOPin sdaPin, GPIOPin sclPin);
    void updateValues();

    int16_t getAccX();
    int16_t getAccY();
    int16_t getAccZ();

    int16_t getGyroX();
    int16_t getGyroY();
    int16_t getGyroZ();

    float getTemp();

    extern int16_t accX, accY, accZ;
    extern int16_t gyroX, gyroY, gyroZ;
    extern int16_t tempRaw;
};

#endif
