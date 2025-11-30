#ifndef SENSOR_VOLT_HPP
#define SENSOR_VOLT_HPP
#include <Arduino.h>

typedef uint8_t GPIOPin;

namespace SensorVoltage
{
    extern float voltage;
    extern GPIOPin sensorPin;

    void initialize(GPIOPin pin);
    void updateValues();
    float getVoltage();
};

#endif
