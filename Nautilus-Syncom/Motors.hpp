#ifndef MOTORS_HPP
#define MOTORS_HPP
#include <Arduino.h>

typedef uint8_t MotorId;
typedef uint8_t GPIOPin;
typedef int8_t MotorSpeed;

namespace Motors {
    void initialize();

    void addMotor(MotorId motorId, GPIOPin gpioPin, bool inverted = false);
    uint8_t getMotorChannel(MotorId motorId);
    void linkRelay(MotorId motorId, int8_t relayId, bool enable = true);
    
    void calibrateMotor(MotorId motorId, bool progressive = true);
    void calibrateAllMotors(bool progressive = true);

    MotorSpeed getMotorSpeed(MotorId motorId);
    void setMotorSpeed(MotorId motorId, MotorSpeed speed, bool soft);
    void sendRaw(MotorId motorId, int nm);
    void setAllMotorsSpeed(MotorSpeed speed, bool soft);

    void stopMotor(MotorId motorId);
    void stopAllMotors();

    void resetMotor(MotorId motorId);
    void resetAllMotors();

    void connectMotor(MotorId motorId);
    void disconnectMotor(MotorId motorId);
    bool isConnected(MotorId motorId);

    bool isValid(MotorId motorId);
    bool needsValidity(MotorId motorId);

    extern const int PWM_FREQUENCY;
    extern const int PWM_RESOLUTION;
    extern const double PWM_PERIOD;
    extern const uint8_t NB_MOTORS;
    extern MotorSpeed motorsSpeed[];
    extern bool motorsCalibrated[];
    extern bool motorsInstalled[];
    extern bool motorsDirection[];
    extern int8_t motorsRelayId[];
};

#endif
