#ifndef SENSORS_HPP
#define SENSORS_HPP
#include <Arduino.h>

typedef uint8_t GPIOPin;

/*
 * Volt  [1] ( v: 0.0 -> 19.01)
 * TF    [2] (cm: 0   -> 65535)
 * Temp  [4] (°C: ?   -> ?    )
 * Acc   [8] ( ?: 0   -> ?    )
 * Gyro [16] ( ?: 0   -> ?    )
 */

namespace Sensors {
    extern const uint8_t VOLT;
    extern const uint8_t TF;
    extern const uint8_t TEMP;
    extern const uint8_t ACC;
    extern const uint8_t GYRO;
    extern const uint8_t MTU;
    extern const uint8_t ALL;

    void initializeSensors();
    void echoSensors(uint8_t sensors, bool state);
    void sendValuesToSIO(uint8_t sensors);
    void tick();
};

#endif
