
#include <Arduino.h>
#include "SIO.hpp"
#include "SensorVoltage.hpp"
#include <HardwareSerial.h>

typedef uint8_t GPIOPin;

namespace SensorVoltage
{
    float voltage;
    GPIOPin sensorPin;

    void initialize(GPIOPin pin)
    {
        sensorPin = pin;
        pinMode(sensorPin, INPUT);
    };
    void updateValues()
    {
        int sensorValue = analogRead(sensorPin);
        voltage = sensorValue * (5.0 / 1023.0) * 0.95;
    }
    float getVoltage() {
        return voltage;
    };
};