#ifndef SENSOR_TF_HPP
#define SENSOR_TF_HPP
#include <Arduino.h>

typedef uint8_t GPIOPin;

namespace SensorTF {
    void initialize(long baudrate, uint32_t config, GPIOPin rxPin, GPIOPin txPin);
    void updateValues(int samples = 3, bool checksum = false);
    int getDistance();
    bool getStrength();

    extern int distance;
    extern bool signalStrength;
};

#endif
